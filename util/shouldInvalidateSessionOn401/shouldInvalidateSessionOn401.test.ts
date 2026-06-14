import axios from "axios";

import { describe, expect, it } from "vitest";

import {
	getSessionInvalidReason,
	isCredentialAttempt401,
	isPublicApiRequestPath,
	shouldInvalidateSessionOn401,
	shouldSkipReportingExpected401,
} from "./shouldInvalidateSessionOn401";

describe("shouldInvalidateSessionOn401", () => {
	it("returns false for login credential 401", () => {
		const error = {
			isAxiosError: true,
			response: { status: 401 },
			config: { method: "post", url: "/users/api-token-auth/" },
		};
		expect(isCredentialAttempt401(error.config)).toBe(true);
		expect(shouldInvalidateSessionOn401(error)).toBe(false);
	});

	it("returns false for public listing endpoints", () => {
		const error = {
			isAxiosError: true,
			response: { status: 401 },
			config: { method: "get", url: "/advertisement/fetch-ad-offered" },
		};
		expect(isPublicApiRequestPath(error.config.url)).toBe(true);
		expect(shouldInvalidateSessionOn401(error)).toBe(false);
	});

	it("returns false for unread chat background polls", () => {
		const error = {
			isAxiosError: true,
			response: { status: 401 },
			config: { method: "get", url: "/chat/unread-channels" },
		};
		expect(shouldInvalidateSessionOn401(error)).toBe(false);
	});

	it("returns true for protected account endpoints", () => {
		const error = {
			isAxiosError: true,
			response: { status: 401 },
			config: { method: "get", url: "/advertisement/fetch-my-ad-offered" },
		};
		expect(shouldInvalidateSessionOn401(error)).toBe(true);
	});

	it("returns true for disabled account even on public paths", () => {
		const error = {
			isAxiosError: true,
			response: {
				status: 401,
				data: { detail: "User account is disabled." },
			},
			config: { method: "get", url: "/advertisement/fetch-ad-offered" },
		};
		expect(getSessionInvalidReason(error)).toBe("account_disabled");
		expect(shouldInvalidateSessionOn401(error)).toBe(true);
	});

	it("returns false for non-axios errors", () => {
		expect(shouldInvalidateSessionOn401(new Error("fail"))).toBe(false);
	});

	it("returns false for non-401 axios errors", () => {
		const error = new axios.AxiosError(
			"Forbidden",
			"403",
			undefined,
			undefined,
			{
				status: 403,
				data: {},
				statusText: "",
				headers: {},
				config: {} as never,
			},
		);
		expect(shouldInvalidateSessionOn401(error)).toBe(false);
	});
});

describe("shouldSkipReportingExpected401", () => {
	const axios401 = (url: string, method = "get") =>
		new axios.AxiosError(
			"Unauthorized",
			"ERR_BAD_REQUEST",
			{ method, url } as never,
			undefined,
			{
				status: 401,
				statusText: "Unauthorized",
				data: { detail: "Invalid token" },
				headers: {},
				config: {} as never,
			},
		);

	it("returns true for optional-auth background 401s", () => {
		expect(
			shouldSkipReportingExpected401(axios401("/chat/unread-channels")),
		).toBe(true);
	});

	it("returns true for public listing 401s", () => {
		expect(
			shouldSkipReportingExpected401(
				axios401("/advertisement/fetch-ad-offered"),
			),
		).toBe(true);
	});

	it("returns false for login credential 401s", () => {
		expect(
			shouldSkipReportingExpected401(
				axios401("/users/api-token-auth/", "post"),
			),
		).toBe(false);
	});

	it("returns false for protected endpoint 401s", () => {
		expect(
			shouldSkipReportingExpected401(
				axios401("/advertisement/fetch-my-ad-offered"),
			),
		).toBe(false);
	});
});
