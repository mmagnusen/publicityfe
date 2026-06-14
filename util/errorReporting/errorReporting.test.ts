import axios, { type InternalAxiosRequestConfig } from "axios";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
	buildAxiosTransportDiagnostics,
	isAbortLikeError,
	isInternalStaffUser,
	isLikelyNetworkError,
	shouldReportError,
	shouldSkipReportingHiddenTabNetworkError,
	shouldSkipReportingOfflineNetworkError,
	shouldSkipReportingTransientNetworkError,
	shouldSkipReportingVisibleTabNetworkError,
} from "./errorReporting";

describe("shouldReportError", () => {
	const originalEnv = process.env;

	afterEach(() => {
		process.env = originalEnv;
	});

	it("returns false for abort-like errors", () => {
		const error = new axios.CanceledError("Request aborted");
		expect(shouldReportError(error)).toBe(false);
		expect(isAbortLikeError(error)).toBe(true);
	});

	it("returns true when the axios request signal was aborted", () => {
		const controller = new AbortController();
		controller.abort();
		const error = new axios.AxiosError("Network Error", "ERR_NETWORK");
		error.config = {
			url: "/chat/fetch-ad-channel-messages/offered_to_rent/1",
			signal: controller.signal,
			headers: new axios.AxiosHeaders(),
		} as InternalAxiosRequestConfig;
		expect(isAbortLikeError(error)).toBe(true);
		expect(buildAxiosTransportDiagnostics(error).transport_kind).toBe(
			"aborted",
		);
	});

	it("returns false for staff users", () => {
		process.env = {
			...originalEnv,
			NODE_ENV: "production",
		};

		expect(shouldReportError(new Error("fail"), { isStaff: true })).toBe(false);
	});

	it("returns false outside production", () => {
		process.env = {
			...originalEnv,
			NODE_ENV: "development",
			NEXT_PUBLIC_ENV: "development",
		};

		expect(shouldReportError(new Error("fail"))).toBe(false);
	});

	it("returns true in production for non-staff, non-abort errors", () => {
		process.env = {
			...originalEnv,
			NODE_ENV: "production",
		};

		expect(shouldReportError(new Error("fail"))).toBe(true);
	});
});

describe("isInternalStaffUser", () => {
	it("detects Admin and Staff groups", () => {
		expect(isInternalStaffUser([{ name: "Admin" }])).toBe(true);
		expect(isInternalStaffUser([{ name: "Member" }])).toBe(false);
		expect(isInternalStaffUser(null)).toBe(false);
	});
});

describe("isLikelyNetworkError", () => {
	it("returns true when axios has no response", () => {
		const error = {
			isAxiosError: true,
			response: undefined,
			message: "timeout",
		};
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		expect(isLikelyNetworkError(error)).toBe(true);
	});

	it("returns true for ERR_NETWORK and ECONNABORTED", () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		expect(
			isLikelyNetworkError({
				isAxiosError: true,
				response: { status: 500 },
				code: "ERR_NETWORK",
			}),
		).toBe(true);
		expect(
			isLikelyNetworkError({
				isAxiosError: true,
				response: { status: 500 },
				code: "ECONNABORTED",
			}),
		).toBe(true);
	});

	it("returns false for axios HTTP errors with a response body", () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		expect(
			isLikelyNetworkError({
				isAxiosError: true,
				response: { status: 400, data: { detail: "Invalid token" } },
				message: "Request failed with status code 400",
			}),
		).toBe(false);
	});

	it("returns true for plain Error with Network Error message", () => {
		expect(isLikelyNetworkError(new Error("Network Error"))).toBe(true);
	});
});

describe("buildAxiosTransportDiagnostics", () => {
	it("classifies ERR_NETWORK as network without http response", () => {
		const error = new axios.AxiosError(
			"Network Error",
			"ERR_NETWORK",
			undefined,
			undefined,
			undefined,
		);
		expect(buildAxiosTransportDiagnostics(error)).toEqual({
			transport_kind: "network",
			axios_code: "ERR_NETWORK",
			had_http_response: false,
			http_status: null,
			error_message: "Network Error",
		});
	});
});

describe("shouldSkipReportingHiddenTabNetworkError", () => {
	it("returns true for network errors when the document is hidden", () => {
		vi.stubGlobal("document", { visibilityState: "hidden" });
		const error = new axios.AxiosError(
			"Network Error",
			"ERR_NETWORK",
			undefined,
			undefined,
			undefined,
		);
		expect(shouldSkipReportingHiddenTabNetworkError(error)).toBe(true);
		vi.unstubAllGlobals();
	});
});

describe("shouldSkipReportingOfflineNetworkError", () => {
	it("returns true when offline and error is network-like", () => {
		vi.stubGlobal("navigator", { onLine: false });
		const error = new axios.AxiosError(
			"Network Error",
			"ERR_NETWORK",
			undefined,
			undefined,
			undefined,
		);
		expect(shouldSkipReportingOfflineNetworkError(error)).toBe(true);
		vi.unstubAllGlobals();
	});
});

describe("shouldSkipReportingVisibleTabNetworkError", () => {
	it("returns true for network errors when the tab is visible and online", () => {
		vi.stubGlobal("document", { visibilityState: "visible" });
		vi.stubGlobal("navigator", { onLine: true });
		const error = new axios.AxiosError(
			"Network Error",
			"ERR_NETWORK",
			undefined,
			undefined,
			undefined,
		);
		expect(shouldSkipReportingVisibleTabNetworkError(error)).toBe(true);
		expect(shouldSkipReportingTransientNetworkError(error)).toBe(true);
		vi.unstubAllGlobals();
	});

	it("returns false for HTTP error responses with a body", () => {
		vi.stubGlobal("document", { visibilityState: "visible" });
		vi.stubGlobal("navigator", { onLine: true });
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const error = {
			isAxiosError: true,
			response: { status: 500, data: { detail: "Server error" } },
			message: "Request failed with status code 500",
		};
		expect(shouldSkipReportingVisibleTabNetworkError(error)).toBe(false);
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});
});
