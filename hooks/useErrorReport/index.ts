import type { ReportErrorOptions } from "./useErrorReport";

export type {
	ReportErrorOptions,
	UseErrorReportOptions,
} from "./useErrorReport";
export { default } from "./useErrorReport";

/** PostHog exception + product event only (no LogSnag). */
export const REPORT_POSTHOG_ONLY = {
	reportToLogsnag: false,
	reportToPosthog: true,
} as const satisfies Partial<ReportErrorOptions>;

/** LogSnag catch-errors only (no PostHog). */
export const REPORT_LOGSNAG_ONLY = {
	reportToLogsnag: true,
	reportToPosthog: false,
} as const satisfies Partial<ReportErrorOptions>;
