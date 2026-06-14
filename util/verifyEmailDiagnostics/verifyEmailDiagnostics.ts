import axios from "axios";

import { isAbortLikeError, isLikelyNetworkError } from "@util/errorReporting";

/** Per-attempt timeout on POST /users/verify-email (axios `timeout` ms). */
export const VERIFY_EMAIL_REQUEST_TIMEOUT_MS = 30_000;

export type VerifyEmailTransportKind =
	| "aborted"
	| "network"
	| "http_error"
	| "client"
	| "unknown";

export type VerifyEmailFailureDiagnostics = {
	duration_ms: number;
	had_http_response: boolean;
	http_status: number | null;
	axios_code: string | null;
	request_timeout_ms: number;
	transport_kind: VerifyEmailTransportKind;
	/** Set when axios-retry exhausted transport retries (verify-email only). */
	retry_attempts: number | null;
};

export const getVerifyEmailAxiosConfig = (signal?: AbortSignal) => ({
	signal,
	timeout: VERIFY_EMAIL_REQUEST_TIMEOUT_MS,
});

export const classifyVerifyEmailTransport = (
	error: unknown,
): VerifyEmailTransportKind => {
	if (isAbortLikeError(error)) return "aborted";
	if (axios.isAxiosError(error) && error.response != null) return "http_error";
	if (isLikelyNetworkError(error)) return "network";
	if (error instanceof Error) return "client";
	return "unknown";
};

const getAxiosRetryCount = (error: unknown): number | null => {
	if (!axios.isAxiosError(error)) return null;
	const retry = (
		error.config as { "axios-retry"?: { retryCount?: number } } | undefined
	)?.["axios-retry"];
	if (retry?.retryCount == null) return null;
	return retry.retryCount + 1;
};

export const buildVerifyEmailFailureDiagnostics = (
	error: unknown,
	startedAtMs: number,
): VerifyEmailFailureDiagnostics => {
	const duration_ms = Math.max(0, Date.now() - startedAtMs);
	const had_http_response = axios.isAxiosError(error) && error.response != null;
	const http_status = axios.isAxiosError(error)
		? (error.response?.status ?? null)
		: null;
	const axios_code = axios.isAxiosError(error) ? (error.code ?? null) : null;
	const transport_kind = classifyVerifyEmailTransport(error);
	const retry_attempts =
		transport_kind === "network" ? getAxiosRetryCount(error) : null;

	return {
		duration_ms,
		had_http_response,
		http_status,
		axios_code,
		request_timeout_ms: VERIFY_EMAIL_REQUEST_TIMEOUT_MS,
		transport_kind,
		retry_attempts,
	};
};

/** Maps transport diagnostics to existing LogSnag `failure_reason` values. */
export const failureReasonFromVerifyEmailDiagnostics = (
	diagnostics: VerifyEmailFailureDiagnostics,
): "network" | "api_or_client" => {
	if (diagnostics.transport_kind === "network") return "network";
	return "api_or_client";
};
