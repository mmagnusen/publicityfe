import axios from "axios";

export const isProductionEnv = (): boolean =>
	process.env.NEXT_PUBLIC_ENV === "production" ||
	process.env.NODE_ENV === "production";

/** User- or client-initiated cancellation (including AbortSignal on axios requests). */
export const isAbortLikeError = (error: unknown): boolean => {
	if (axios.isAxiosError(error)) {
		const message = error.message?.toLowerCase() ?? "";
		if (error.code === "ERR_CANCELED" || message.includes("aborted")) {
			return true;
		}
		const signal = error.config?.signal;
		if (
			signal != null &&
			"aborted" in signal &&
			(signal as AbortSignal).aborted
		) {
			return true;
		}
	}
	if (error instanceof DOMException) {
		return error.name === "AbortError";
	}
	if (error instanceof Error) {
		const message = error.message?.toLowerCase() ?? "";
		return error.name === "AbortError" || message.includes("request aborted");
	}
	return false;
};

/** Axios transport failures (offline, timeout, DNS) vs HTTP error responses from the API. */
export const isLikelyNetworkError = (error: unknown): boolean => {
	if (axios.isAxiosError(error)) {
		if (!error.response) return true;
		return (
			error.code === "ERR_NETWORK" ||
			error.code === "ECONNABORTED" ||
			error.message === "Network Error"
		);
	}
	return error instanceof Error && error.message === "Network Error";
};

export const isInternalStaffUser = (
	groups?: Array<{ name: string }> | null,
): boolean =>
	groups?.some((group) => ["Admin", "Staff"].includes(group.name)) ?? false;

export type AxiosTransportKind =
	| "aborted"
	| "network"
	| "http_error"
	| "client"
	| "unknown";

export type AxiosTransportDiagnostics = {
	transport_kind: AxiosTransportKind;
	axios_code: string | null;
	had_http_response: boolean;
	http_status: number | null;
	error_message: string | null;
};

export const classifyAxiosTransport = (error: unknown): AxiosTransportKind => {
	if (isAbortLikeError(error)) return "aborted";
	if (axios.isAxiosError(error) && error.response != null) return "http_error";
	if (isLikelyNetworkError(error)) return "network";
	if (error instanceof Error) return "client";
	return "unknown";
};

export const buildAxiosTransportDiagnostics = (
	error: unknown,
): AxiosTransportDiagnostics => {
	const transport_kind = classifyAxiosTransport(error);
	return {
		transport_kind,
		axios_code: axios.isAxiosError(error) ? (error.code ?? null) : null,
		had_http_response: axios.isAxiosError(error) && error.response != null,
		http_status: axios.isAxiosError(error)
			? (error.response?.status ?? null)
			: null,
		error_message: error instanceof Error ? error.message : null,
	};
};

/** Skip reporting obvious offline blips (API is often fine when the tab has no connectivity). */
export const shouldSkipReportingOfflineNetworkError = (
	error: unknown,
): boolean => {
	if (typeof navigator === "undefined" || navigator.onLine) return false;
	return isLikelyNetworkError(error);
};

/** Background tabs often hit transient ERR_NETWORK when the OS suspends networking. */
export const shouldSkipReportingHiddenTabNetworkError = (
	error: unknown,
): boolean => {
	if (!isLikelyNetworkError(error)) return false;
	if (typeof document === "undefined") return false;
	return document.visibilityState !== "visible";
};

/** Active visible tabs still hit transient ERR_NETWORK (Wi‑Fi blips, captive portals). */
export const shouldSkipReportingVisibleTabNetworkError = (
	error: unknown,
): boolean => {
	if (!isLikelyNetworkError(error)) return false;
	if (typeof document === "undefined") return false;
	if (typeof navigator !== "undefined" && !navigator.onLine) return false;
	return document.visibilityState === "visible";
};

/** Noise reduction for transport failures that are usually environmental, not app bugs. */
export const shouldSkipReportingTransientNetworkError = (
	error: unknown,
): boolean =>
	shouldSkipReportingOfflineNetworkError(error) ||
	shouldSkipReportingHiddenTabNetworkError(error) ||
	shouldSkipReportingVisibleTabNetworkError(error);

export type ShouldReportErrorOptions = {
	isStaff?: boolean;
};

/** Shared gate for LogSnag `catch-errors` and other external error reporting. */
export const shouldReportError = (
	error: unknown,
	options?: ShouldReportErrorOptions,
): boolean => {
	if (isAbortLikeError(error)) return false;
	if (options?.isStaff) return false;
	if (!isProductionEnv()) return false;
	return true;
};
