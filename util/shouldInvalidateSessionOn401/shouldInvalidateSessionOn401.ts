import axios from "axios";

/**
 * Public read-only API paths. A 401 here (e.g. stale JWT attached to a public
 * listing request) must not tear down the SPA session while the user is browsing.
 */
const PUBLIC_API_PATH_PREFIXES = [
	"/advertisement/fetch-ad-offered",
	"/advertisement/fetch-ad-wanted",
	"/advertisement/fetch-single-ad-offered/",
	"/advertisement/fetch-single-ad-wanted/",
	"/advertisement/fetch-related-ad-offered/",
	"/advertisement/fetch-related-ad-wanted/",
	"/location-hub/locations",
	"/location-hub/location-hub-by-slug/",
	"/events/",
	"/blog/",
	"/shop/items",
	"/users/public-users",
] as const;

/**
 * Authenticated background polls. Fail silently in UI; do not redirect home on 401
 * while the user browses public pages (e.g. /rental-offered).
 */
const OPTIONAL_AUTH_API_PATH_PREFIXES = [
	"/chat/unread-channels",
	"/chat/unread-threads",
	"/notification",
	"/users/api-token-verify/",
] as const;

/** Wrong password on login can return 401 while an old JWT is still attached. */
export const isCredentialAttempt401 = (config: unknown): boolean => {
	if (!config || typeof config !== "object") {
		return false;
	}
	const c = config as { url?: string; method?: string };
	const method = (c.method ?? "get").toUpperCase();
	const url = c.url ?? "";
	return method === "POST" && url.includes("api-token-auth");
};

export const normalizeApiRequestPath = (url: string | undefined): string => {
	if (!url) return "";
	const withoutQuery = url.split("?")[0] ?? "";
	if (
		withoutQuery.startsWith("http://") ||
		withoutQuery.startsWith("https://")
	) {
		try {
			return new URL(withoutQuery).pathname;
		} catch {
			return withoutQuery;
		}
	}
	return withoutQuery;
};

const pathMatchesPrefix = (path: string, prefix: string): boolean =>
	path === prefix || path.startsWith(prefix);

export const isPublicApiRequestPath = (url: string | undefined): boolean => {
	const path = normalizeApiRequestPath(url);
	return PUBLIC_API_PATH_PREFIXES.some((prefix) =>
		pathMatchesPrefix(path, prefix),
	);
};

export const isOptionalAuthApiRequestPath = (
	url: string | undefined,
): boolean => {
	const path = normalizeApiRequestPath(url);
	return OPTIONAL_AUTH_API_PATH_PREFIXES.some((prefix) =>
		pathMatchesPrefix(path, prefix),
	);
};

const getResponseDetail = (error: unknown): string | undefined => {
	if (!axios.isAxiosError(error)) return undefined;
	const raw = error.response?.data;
	if (typeof raw !== "object" || raw === null) return undefined;
	const d = (raw as { detail?: unknown }).detail;
	return typeof d === "string" ? d.trim() : undefined;
};

export type SessionInvalidReason = "account_disabled" | "generic";

export const getSessionInvalidReason = (
	error: unknown,
): SessionInvalidReason => {
	const detail = getResponseDetail(error)?.toLowerCase();
	return detail === "user account is disabled."
		? "account_disabled"
		: "generic";
};

/**
 * Whether a 401 should clear cookies and log the user out globally.
 * Login failures and public/background requests are excluded.
 */
export const shouldInvalidateSessionOn401 = (error: unknown): boolean => {
	if (!axios.isAxiosError(error)) return false;
	if (error.response?.status !== 401) return false;

	const cfg = error.config;
	if (isCredentialAttempt401(cfg)) return false;

	// Deactivated accounts should always end the session.
	if (getSessionInvalidReason(error) === "account_disabled") {
		return true;
	}

	const url = cfg?.url;
	if (isPublicApiRequestPath(url)) return false;
	if (isOptionalAuthApiRequestPath(url)) return false;

	return true;
};

/**
 * Skip error reporting for 401s that are expected in normal browsing
 * (stale JWT on public pages, background polls). Login credential 401s and
 * disabled-account 401s are still reported when callers invoke reportError.
 */
export const shouldSkipReportingExpected401 = (error: unknown): boolean => {
	if (!axios.isAxiosError(error)) return false;
	if (error.response?.status !== 401) return false;
	if (isCredentialAttempt401(error.config)) return false;
	if (getSessionInvalidReason(error) === "account_disabled") return false;

	const url = error.config?.url;
	return isPublicApiRequestPath(url) || isOptionalAuthApiRequestPath(url);
};
