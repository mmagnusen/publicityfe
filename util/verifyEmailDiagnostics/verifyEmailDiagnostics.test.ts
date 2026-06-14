import axios from "axios";

import { describe, expect, it, vi } from "vitest";

import {
	buildVerifyEmailFailureDiagnostics,
	classifyVerifyEmailTransport,
	VERIFY_EMAIL_REQUEST_TIMEOUT_MS,
} from "./verifyEmailDiagnostics";

describe("verifyEmailDiagnostics", () => {
	it("classifies abort-like errors separately from network", () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		expect(
			classifyVerifyEmailTransport({
				isAxiosError: true,
				code: "ERR_CANCELED",
				message: "canceled",
			}),
		).toBe("aborted");
	});

	it("classifies HTTP errors with response body", () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		expect(
			classifyVerifyEmailTransport({
				isAxiosError: true,
				response: { status: 400, data: { detail: "Invalid token" } },
				message: "Request failed with status code 400",
			}),
		).toBe("http_error");
	});

	it("classifies transport failures without response as network", () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		expect(
			classifyVerifyEmailTransport({
				isAxiosError: true,
				code: "ECONNABORTED",
				message: "timeout of 30000ms exceeded",
			}),
		).toBe("network");
	});

	it("builds diagnostics with duration and timeout", () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const startedAt = Date.now() - 12_500;
		const diagnostics = buildVerifyEmailFailureDiagnostics(
			{
				isAxiosError: true,
				code: "ECONNABORTED",
				config: { "axios-retry": { retryCount: 2 } },
			},
			startedAt,
		);

		expect(diagnostics.duration_ms).toBeGreaterThanOrEqual(12_500);
		expect(diagnostics.had_http_response).toBe(false);
		expect(diagnostics.request_timeout_ms).toBe(
			VERIFY_EMAIL_REQUEST_TIMEOUT_MS,
		);
		expect(diagnostics.transport_kind).toBe("network");
		expect(diagnostics.retry_attempts).toBe(3);
		expect(diagnostics.axios_code).toBe("ECONNABORTED");
	});
});
