import axios from "axios";

import { renderHook } from "@testing-library/react";
import * as posthogProductErrorReporting from "@util/posthogProductErrorReporting";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetErrorReportDedupeForTests } from "./errorReportDedupe";
import useErrorReport from "./useErrorReport";

const mockTrackEvent = vi.fn();
let mockAuthenticatedUserGroups: Array<{ name: string }> = [];
let mockAuthenticatedUserPk: number | null = null;

vi.mock("@hooks/useLogs", () => ({
	useLogs: () => ({ trackEvent: mockTrackEvent }),
}));

vi.mock("@hooks/useAuthenticatedUser", () => ({
	useAuthenticatedUser: () => ({
		authenticatedUser: {
			groups: mockAuthenticatedUserGroups,
			pk: mockAuthenticatedUserPk,
		},
	}),
}));

const originalEnv = process.env;

const withProductionEnv = (posthogKey = "phc_test") => {
	process.env = {
		...originalEnv,
		NODE_ENV: "production",
		NEXT_PUBLIC_POSTHOG_KEY: posthogKey,
	};
};

describe("useErrorReport", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetErrorReportDedupeForTests();
		mockAuthenticatedUserGroups = [];
		mockAuthenticatedUserPk = null;
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.restoreAllMocks();
	});

	it("dedupes repeated reports for the same error at the same call site", () => {
		withProductionEnv();
		const reportProductErrorToPosthog = vi
			.spyOn(posthogProductErrorReporting, "reportProductErrorToPosthog")
			.mockImplementation(() => {});
		const error = new Error("test failure");
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
			}),
		);

		result.current.reportError(error, "handleSendChatMessage");
		result.current.reportError(error, "handleSendChatMessage");

		expect(reportProductErrorToPosthog).toHaveBeenCalledTimes(1);
		expect(mockTrackEvent).toHaveBeenCalledTimes(1);
	});

	it("sends PostHog and LogSnag catch-errors by default", () => {
		withProductionEnv();
		const reportProductErrorToPosthog = vi
			.spyOn(posthogProductErrorReporting, "reportProductErrorToPosthog")
			.mockImplementation(() => {});
		const error = new Error("test failure");
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
			}),
		);

		result.current.reportError(error, "handleSendChatMessage");

		expect(reportProductErrorToPosthog).toHaveBeenCalledWith(error, {
			context: "useChat > handleSendChatMessage",
			productEvent: "chat_error",
			properties: { user_pk: null },
			logsnagSummary: "action=handleSendChatMessage. message=test failure",
			isStaff: false,
		});
		expect(mockTrackEvent).toHaveBeenCalledWith({
			channel: "catch-errors",
			event: "Chat error",
			description:
				"action=handleSendChatMessage. posthog_capture_attempted=true. posthog_initialized=false. message=test failure",
			functionName: "useChat > handleSendChatMessage",
		});
	});

	it("skips both channels when shouldReportError fails", () => {
		withProductionEnv();
		mockAuthenticatedUserGroups = [{ name: "Admin" }];
		const reportProductErrorToPosthog = vi.spyOn(
			posthogProductErrorReporting,
			"reportProductErrorToPosthog",
		);
		const error = new Error("test failure");
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
			}),
		);

		result.current.reportError(error, "handleSendChatMessage");

		expect(reportProductErrorToPosthog).not.toHaveBeenCalled();
		expect(mockTrackEvent).not.toHaveBeenCalled();
	});

	it("can report to LogSnag only", () => {
		withProductionEnv();
		const reportProductErrorToPosthog = vi.spyOn(
			posthogProductErrorReporting,
			"reportProductErrorToPosthog",
		);
		const error = new Error("test failure");
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
			}),
		);

		result.current.reportError(error, "handleSendChatMessage", {
			reportToPosthog: false,
		});

		expect(reportProductErrorToPosthog).not.toHaveBeenCalled();
		expect(mockTrackEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				description: expect.stringContaining("posthog_capture_attempted=false"),
			}),
		);
	});

	it("can report to PostHog only", () => {
		withProductionEnv();
		const reportProductErrorToPosthog = vi
			.spyOn(posthogProductErrorReporting, "reportProductErrorToPosthog")
			.mockImplementation(() => {});
		const error = new Error("test failure");
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
			}),
		);

		result.current.reportError(error, "handleSendChatMessage", {
			reportToLogsnag: false,
		});

		expect(reportProductErrorToPosthog).toHaveBeenCalled();
		expect(mockTrackEvent).not.toHaveBeenCalled();
	});

	it("forwards optional properties to PostHog and LogSnag", () => {
		withProductionEnv();
		mockAuthenticatedUserPk = 7;
		const reportProductErrorToPosthog = vi
			.spyOn(posthogProductErrorReporting, "reportProductErrorToPosthog")
			.mockImplementation(() => {});
		const error = new Error("test failure");
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
				posthogProductEvent: "chat_error",
			}),
		);

		result.current.reportError(error, "fetchAdChannelMessages", {
			properties: {
				ad_id: 42,
				ad_type: "offered_to_rent",
				user_email: "user@example.com",
			},
		});

		expect(reportProductErrorToPosthog).toHaveBeenCalledWith(error, {
			context: "useChat > fetchAdChannelMessages",
			productEvent: "chat_error",
			properties: {
				ad_id: 42,
				ad_type: "offered_to_rent",
				user_email: "user@example.com",
				user_pk: 7,
			},
			logsnagSummary:
				"action=fetchAdChannelMessages. ad_id=42. ad_type=offered_to_rent. user_email=user@example.com. message=test failure",
			isStaff: false,
		});
		expect(mockTrackEvent).toHaveBeenCalledWith({
			channel: "catch-errors",
			event: "Chat error",
			description:
				"action=fetchAdChannelMessages. ad_id=42. ad_type=offered_to_rent. user_email=user@example.com. posthog_capture_attempted=true. posthog_initialized=false. message=test failure",
			functionName: "useChat > fetchAdChannelMessages",
		});
	});

	it("skips both channels for transient network errors", () => {
		withProductionEnv();
		const reportProductErrorToPosthog = vi.spyOn(
			posthogProductErrorReporting,
			"reportProductErrorToPosthog",
		);
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			value: "visible",
		});
		Object.defineProperty(navigator, "onLine", {
			configurable: true,
			value: true,
		});
		const error = new Error("Network Error");
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
			}),
		);

		result.current.reportError(error, "fetchAdChannelMessages");

		expect(reportProductErrorToPosthog).not.toHaveBeenCalled();
		expect(mockTrackEvent).not.toHaveBeenCalled();
	});

	it("skips both channels for expected background 401s", () => {
		withProductionEnv();
		const reportProductErrorToPosthog = vi.spyOn(
			posthogProductErrorReporting,
			"reportProductErrorToPosthog",
		);
		const error = new axios.AxiosError(
			"Unauthorized",
			"ERR_BAD_REQUEST",
			{ method: "get", url: "/chat/unread-channels" } as never,
			undefined,
			{
				status: 401,
				statusText: "Unauthorized",
				data: { detail: "Invalid token" },
				headers: {},
				config: {} as never,
			},
		);
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
			}),
		);

		result.current.reportError(error, "unreadChannels");

		expect(reportProductErrorToPosthog).not.toHaveBeenCalled();
		expect(mockTrackEvent).not.toHaveBeenCalled();
	});

	it("logs LogSnag when PostHog is not configured and records skip reason", () => {
		withProductionEnv("");
		const reportProductErrorToPosthog = vi.spyOn(
			posthogProductErrorReporting,
			"reportProductErrorToPosthog",
		);
		const error = new Error("test failure");
		const { result } = renderHook(() =>
			useErrorReport({
				functionNamePrefix: "useChat",
				defaultEvent: "Chat error",
			}),
		);

		result.current.reportError(error, "fetchAdChannelMessages");

		expect(reportProductErrorToPosthog).not.toHaveBeenCalled();
		expect(mockTrackEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				description: expect.stringMatching(
					/posthog_capture_attempted=false.*posthog_initialized=false.*posthog_skip_reason=posthog_not_configured/,
				),
			}),
		);
	});
});
