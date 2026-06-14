import axios from "axios";

import {
	isAbortLikeError,
	isProductionEnv,
	shouldReportError,
} from "@util/errorReporting";
import { normalizeErrorForCapture } from "@util/normalizeErrorForCapture";
import posthog from "posthog-js";

export { isAbortLikeError, shouldReportError } from "@util/errorReporting";

export const isPosthogConfigured = (): boolean =>
	Boolean(isProductionEnv() && process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());

export const isPosthogInitialized = (): boolean => {
	const client = posthog as { __loaded?: boolean; config?: { token?: string } };
	return Boolean(client.__loaded || client.config?.token);
};

/** PostHog-specific gate on top of {@link shouldReportError}. */
export const shouldSendPosthogException = (
	error: unknown,
	options?: { isStaff?: boolean },
): boolean => shouldReportError(error, options) && isPosthogConfigured();

/** Why PostHog was skipped while LogSnag may still report (production, non-staff). */
export const posthogSkipReasonForError = (
	error: unknown,
	options?: { isStaff?: boolean },
): string | null => {
	if (!shouldReportError(error, options)) return null;
	if (shouldSendPosthogException(error, options)) return null;
	if (!isPosthogConfigured()) return "posthog_not_configured";
	return "posthog_filtered";
};

export const detectInAppBrowser = (): string | null => {
	if (typeof navigator === "undefined") return null;
	const ua = navigator.userAgent.toLowerCase();
	if (ua.includes("instagram")) return "instagram";
	if (ua.includes("fbav") || ua.includes("fban")) return "facebook";
	if (ua.includes("twitter")) return "twitter";
	if (ua.includes("linkedin")) return "linkedin";
	if (ua.includes("tiktok")) return "tiktok";
	return null;
};

type ScrubRequestDataOptions = {
	redactKeys?: string[];
};

export const axiosDetailsForError = (
	error: unknown,
	options?: ScrubRequestDataOptions,
): Record<string, unknown> => {
	if (!axios.isAxiosError(error)) return {};

	const redactKeys = options?.redactKeys ?? ["password", "token"];
	const rawData = error.config?.data;
	let scrubbedData = rawData;
	try {
		const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
		if (parsed && typeof parsed === "object") {
			const rest = { ...(parsed as Record<string, unknown>) };
			redactKeys.forEach((key) => {
				if (key in rest) {
					rest[key] = "[redacted]";
				}
			});
			scrubbedData = rest;
		}
	} catch {
		/* leave as-is if not JSON */
	}

	return {
		request_method: error.config?.method?.toUpperCase(),
		request_url: error.config?.url,
		request_params: error.config?.params,
		request_data: scrubbedData,
		response_status: error.response?.status,
		response_data: error.response?.data,
	};
};

export type ProductErrorReportOptions = {
	context: string;
	/** Backup analytics event name (e.g. `login_failed`). */
	productEvent: string;
	properties?: Record<string, unknown>;
	logsnagSummary?: string;
	scrubRequestKeys?: string[];
	isStaff?: boolean;
};

/** Reports a product error to PostHog (exception + backup product event). */
export const reportProductErrorToPosthog = (
	error: unknown,
	{
		context,
		productEvent,
		properties = {},
		logsnagSummary,
		scrubRequestKeys,
		isStaff,
	}: ProductErrorReportOptions,
): void => {
	if (!shouldSendPosthogException(error, { isStaff })) return;

	const client = posthog;
	if (!client) return;

	const normalizedError = normalizeErrorForCapture(error);
	const exceptionProperties: Record<string, unknown> = {
		context,
		...properties,
		...axiosDetailsForError(error, { redactKeys: scrubRequestKeys }),
		...(logsnagSummary ? { logsnag_summary: logsnagSummary } : {}),
		posthog_initialized: isPosthogInitialized(),
		in_app_browser: detectInAppBrowser(),
		user_agent:
			typeof navigator !== "undefined" ? navigator.userAgent : undefined,
		page_path:
			typeof window !== "undefined" ? window.location.pathname : undefined,
		page_url: typeof window !== "undefined" ? window.location.href : undefined,
	};

	if (typeof client.captureException === "function") {
		client.captureException(normalizedError, exceptionProperties);
	} else {
		client.capture("$exception", {
			$exception_message: normalizedError.message,
			$exception_type: normalizedError.name,
			$exception_stack_trace_raw: normalizedError.stack,
			...exceptionProperties,
		});
	}

	client.capture(productEvent, {
		...exceptionProperties,
		error_message: normalizedError.message,
		error_name: normalizedError.name,
	});

	const flushable = client as { flush?: () => void | Promise<void> };
	if (typeof flushable.flush === "function") {
		void flushable.flush();
	}
};
