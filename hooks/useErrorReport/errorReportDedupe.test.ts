import axios from "axios";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	buildErrorReportDedupeKey,
	ERROR_REPORT_DEDUPE_MS,
	resetErrorReportDedupeForTests,
	tryClaimErrorReportSlot,
} from "./errorReportDedupe";

describe("errorReportDedupe", () => {
	beforeEach(() => {
		resetErrorReportDedupeForTests();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("builds stable keys for axios errors", () => {
		const error = new axios.AxiosError(
			"Request failed",
			"ERR_BAD_REQUEST",
			{ method: "get", url: "/chat/unread-channels" } as never,
			undefined,
			{
				status: 500,
				statusText: "Server Error",
				data: { detail: "fail" },
				headers: {},
				config: {} as never,
			},
		);

		const key = buildErrorReportDedupeKey("useChat > fetchMessages", error);
		expect(key).toContain("useChat > fetchMessages");
		expect(key).toContain("/chat/unread-channels");
		expect(key).toContain("500");
	});

	it("dedupes repeated claims within the window", () => {
		const key = buildErrorReportDedupeKey(
			"useChat > fetchMessages",
			new Error("boom"),
		);

		expect(tryClaimErrorReportSlot(key)).toBe(true);
		expect(tryClaimErrorReportSlot(key)).toBe(false);
	});

	it("allows the same error again after the dedupe window", () => {
		const key = buildErrorReportDedupeKey(
			"useChat > fetchMessages",
			new Error("boom"),
		);

		expect(tryClaimErrorReportSlot(key)).toBe(true);
		vi.advanceTimersByTime(ERROR_REPORT_DEDUPE_MS);
		expect(tryClaimErrorReportSlot(key)).toBe(true);
	});

	it("treats different call sites separately", () => {
		const error = new Error("boom");

		expect(
			tryClaimErrorReportSlot(
				buildErrorReportDedupeKey("useChat > fetchMessages", error),
			),
		).toBe(true);
		expect(
			tryClaimErrorReportSlot(
				buildErrorReportDedupeKey("useChat > sendMessage", error),
			),
		).toBe(true);
	});
});
