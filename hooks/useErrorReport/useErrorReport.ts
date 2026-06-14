import { useCallback } from "react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { useLogs } from "@hooks/useLogs";
import { catchErrorsDescription } from "@util/catchErrorsLogsnagDescription";
import {
	isAbortLikeError,
	isInternalStaffUser,
	isProductionEnv,
	shouldSkipReportingTransientNetworkError,
} from "@util/errorReporting";
import {
	isPosthogInitialized,
	posthogSkipReasonForError,
	reportProductErrorToPosthog,
	shouldSendPosthogException,
} from "@util/posthogProductErrorReporting";
import { shouldSkipReportingExpected401 } from "@util/shouldInvalidateSessionOn401";

import {
	buildErrorReportDedupeKey,
	tryClaimErrorReportSlot,
} from "./errorReportDedupe";

export type ReportErrorOptions = {
	event?: string;
	reportToLogsnag?: boolean;
	reportToPosthog?: boolean;
	properties?: Record<string, unknown>;
	/** Overrides hook-level {@link UseErrorReportOptions.posthogProductEvent}. */
	posthogProductEvent?: string;
	/** Custom LogSnag description (defaults to {@link catchErrorsDescription}). */
	logsnagDescription?: string;
	scrubRequestKeys?: string[];
};

export type UseErrorReportOptions = {
	functionNamePrefix?: string;
	defaultEvent?: string;
	posthogProductEvent?: string;
};

const defaultPosthogProductEvent = (event: string): string =>
	event.trim().toLowerCase().replace(/\s+/g, "_");

const useErrorReport = ({
	functionNamePrefix = "",
	defaultEvent = "Error",
	posthogProductEvent,
}: UseErrorReportOptions = {}) => {
	const { authenticatedUser } = useAuthenticatedUser();
	const isStaff = isInternalStaffUser(authenticatedUser?.groups);
	const userPk = authenticatedUser?.pk ?? null;
	const { trackEvent } = useLogs();

	const reportError = useCallback(
		(error: unknown, context: string, options?: ReportErrorOptions) => {
			const {
				event = defaultEvent,
				reportToLogsnag = true,
				reportToPosthog = true,
				properties,
				posthogProductEvent: posthogProductEventOverride,
				logsnagDescription,
				scrubRequestKeys,
			} = options ?? {};

			if (!reportToLogsnag && !reportToPosthog) {
				return;
			}
			if (isStaff) return;

			if (!isProductionEnv()) {
				return;
			}

			if (isAbortLikeError(error)) {
				return;
			}

			if (shouldSkipReportingTransientNetworkError(error)) {
				return;
			}

			if (shouldSkipReportingExpected401(error)) {
				return;
			}

			const functionName = `${functionNamePrefix} > ${context}`;

			if (
				!tryClaimErrorReportSlot(buildErrorReportDedupeKey(functionName, error))
			) {
				return;
			}

			const productEvent =
				posthogProductEventOverride ??
				posthogProductEvent ??
				defaultPosthogProductEvent(event);

			const posthogProperties = {
				...(properties ?? {}),
				user_pk: userPk,
			};

			const shouldReportToPosthog =
				reportToPosthog && shouldSendPosthogException(error, { isStaff });

			let posthogCaptureAttempted = false;
			if (shouldReportToPosthog) {
				reportProductErrorToPosthog(error, {
					context: functionName,
					productEvent,
					properties: posthogProperties,
					logsnagSummary:
						logsnagDescription ??
						catchErrorsDescription(context, error, properties),
					scrubRequestKeys,
					isStaff,
				});
				posthogCaptureAttempted = true;
			}

			const posthogSkipReason = reportToPosthog
				? posthogSkipReasonForError(error, { isStaff })
				: null;

			if (reportToLogsnag) {
				const logsnagExtras: Record<string, unknown> = {
					...(properties ?? {}),
					posthog_capture_attempted: posthogCaptureAttempted,
					posthog_initialized: isPosthogInitialized(),
				};
				if (posthogSkipReason) {
					logsnagExtras.posthog_skip_reason = posthogSkipReason;
				}

				trackEvent({
					channel: "catch-errors",
					event,
					description:
						logsnagDescription ??
						catchErrorsDescription(context, error, logsnagExtras),
					functionName,
				});
			}
		},
		[
			defaultEvent,
			functionNamePrefix,
			isStaff,
			posthogProductEvent,
			trackEvent,
			userPk,
		],
	);

	return { reportError };
};

export default useErrorReport;
