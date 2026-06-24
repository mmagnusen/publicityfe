import axios from "axios";

import { normalizeApiRequestPath } from "@util/shouldInvalidateSessionOn401";

/** Collapse retry/SWR/poll bursts for the same failure at the same call site. */
export const ERROR_REPORT_DEDUPE_MS = 60_000;

const MAX_DEDUPE_ENTRIES = 200;

const recentReports = new Map<string, number>();

export const buildErrorReportDedupeKey = (
	functionName: string,
	error: unknown,
): string => {
	const parts = [functionName];

	if (axios.isAxiosError(error)) {
		parts.push(
			"axios",
			error.code ?? "",
			String(error.response?.status ?? ""),
			normalizeApiRequestPath(error.config?.url),
			(error.message ?? "").slice(0, 200),
		);
	} else if (error instanceof Error) {
		parts.push(error.name, error.message.slice(0, 200));
	} else {
		parts.push(String(error).slice(0, 200));
	}

	return parts.join("|");
};

const pruneExpiredDedupeEntries = (now: number): void => {
	recentReports.forEach((reportedAt, key) => {
		if (now - reportedAt >= ERROR_REPORT_DEDUPE_MS) {
			recentReports.delete(key);
		}
	});
	while (recentReports.size > MAX_DEDUPE_ENTRIES) {
		const oldestKey = recentReports.keys().next().value;
		if (oldestKey === undefined) break;
		recentReports.delete(oldestKey);
	}
};

/** Returns false when the same error was reported recently at this call site. */
export const tryClaimErrorReportSlot = (key: string): boolean => {
	const now = Date.now();
	const lastReportedAt = recentReports.get(key);
	if (lastReportedAt != null && now - lastReportedAt < ERROR_REPORT_DEDUPE_MS) {
		return false;
	}

	recentReports.set(key, now);
	pruneExpiredDedupeEntries(now);
	return true;
};

/** Test helper- clears the in-memory dedupe cache. */
export const resetErrorReportDedupeForTests = (): void => {
	recentReports.clear();
};
