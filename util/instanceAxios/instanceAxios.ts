import axios from "axios";

import API_ENDPOINT from "@constants/apiEndpoints";
import {
	AUTHENTICATED_USER_COOKIE,
	AUTHENTICATED_USER_EMAIL_VERIFIED,
	AUTHENTICATED_USER_IDENTITY_VERIFIED,
	AUTHENTICATED_USER_PROFILE_PIC_URL,
} from "@constants/cookies";
import {
	clearAuthSessionCookies,
	notifySessionExpired,
} from "@util/authSessionCookies";
import { notifyUnauthorizedWithJwt } from "@util/authUnauthorizedHandler";
import { isAbortLikeError, isLikelyNetworkError } from "@util/errorReporting";
import {
	getSessionInvalidReason,
	shouldInvalidateSessionOn401,
} from "@util/shouldInvalidateSessionOn401";
import { VERIFY_EMAIL_REQUEST_TIMEOUT_MS } from "@util/verifyEmailDiagnostics";
import axiosRetry from "axios-retry";
import { isJwtExpired } from "jwt-check-expiration";
import { isEmpty } from "lodash";
import Cookies from "universal-cookie";

/** Initial request + axios-retry attempts on transport failure (`retries` + 1). */
export const TRANSPORT_MAX_NETWORK_ATTEMPTS = 3;

/** @deprecated Use {@link TRANSPORT_MAX_NETWORK_ATTEMPTS}. */
export const VERIFY_EMAIL_MAX_NETWORK_ATTEMPTS = TRANSPORT_MAX_NETWORK_ATTEMPTS;

const VERIFY_EMAIL_RETRY_DELAY_MS = 1600;
const CHAT_TRANSPORT_RETRY_DELAY_MS = 800;

const CHAT_API_PATH = "/chat/";

const isIdempotentHttpMethod = (method: string | undefined): boolean => {
	const normalized = (method ?? "get").toLowerCase();
	return normalized === "get" || normalized === "head";
};

const verifyEmailTransportRetryCondition = (error: unknown): boolean => {
	if (isAbortLikeError(error)) return false;
	if (!axios.isAxiosError(error)) return false;
	const url = error.config?.url ?? "";
	if (!url.includes("verify-email")) return false;
	return isLikelyNetworkError(error);
};

/** GET/HEAD chat reads only — do not retry POST sends (duplicate messages). */
const chatTransportRetryCondition = (error: unknown): boolean => {
	if (isAbortLikeError(error)) return false;
	if (!axios.isAxiosError(error)) return false;
	const url = error.config?.url ?? "";
	if (!url.includes(CHAT_API_PATH)) return false;
	if (!isIdempotentHttpMethod(error.config?.method)) return false;
	return isLikelyNetworkError(error);
};

const transportRetryCondition = (error: unknown): boolean =>
	verifyEmailTransportRetryCondition(error) ||
	chatTransportRetryCondition(error);

export const instanceAxios = axios.create({
	responseType: "json",
	xsrfCookieName: "csrftoken",
	xsrfHeaderName: "X-CSRFToken",
	baseURL: API_ENDPOINT,
});

const cookies = new Cookies(null, { path: "/" });

instanceAxios.interceptors.request.use(
	async (config) => {
		const authenticatedUser = cookies.get(AUTHENTICATED_USER_COOKIE);
		const token = authenticatedUser?.token;
		const tokenExists = !isEmpty(token);

		const url = config.url ?? "";
		if (url.includes("verify-email") && config.timeout == null) {
			config.timeout = VERIFY_EMAIL_REQUEST_TIMEOUT_MS;
		}

		if (!tokenExists) {
			config.headers.Authorization = undefined;
			return config;
		}

		const isExpired = await isJwtExpired(token);

		if (!isExpired) {
			config.headers.Authorization = `JWT ${token}`;
			return config;
		}

		clearAuthSessionCookies(cookies);
		notifySessionExpired();
		config.headers.Authorization = undefined;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

axiosRetry(instanceAxios, {
	retries: TRANSPORT_MAX_NETWORK_ATTEMPTS - 1,
	retryCondition: transportRetryCondition,
	retryDelay: (retryCount, error) => {
		const url = axios.isAxiosError(error) ? (error.config?.url ?? "") : "";
		const delayMs = url.includes(CHAT_API_PATH)
			? CHAT_TRANSPORT_RETRY_DELAY_MS
			: VERIFY_EMAIL_RETRY_DELAY_MS;
		return retryCount * delayMs;
	},
	shouldResetTimeout: true,
});

const hardClearAuthCookies = (): void => {
	try {
		cookies.remove(AUTHENTICATED_USER_COOKIE, { path: "/" });
		cookies.remove(AUTHENTICATED_USER_PROFILE_PIC_URL, { path: "/" });
		cookies.remove(AUTHENTICATED_USER_EMAIL_VERIFIED, { path: "/" });
		cookies.remove(AUTHENTICATED_USER_IDENTITY_VERIFIED, { path: "/" });
	} catch {
		/* ignore */
	}
};

/** Wrong password on login can return 401 while an old JWT is still attached — do not clear the session. */

instanceAxios.interceptors.response.use(
	(response) => response,
	async (error: unknown) => {
		if (!axios.isAxiosError(error)) {
			return Promise.reject(error);
		}
		if (shouldInvalidateSessionOn401(error)) {
			let notified = false;
			try {
				notified = await notifyUnauthorizedWithJwt(
					getSessionInvalidReason(error),
				);
			} catch {
				notified = false;
			}
			if (!notified && typeof window !== "undefined") {
				hardClearAuthCookies();
				window.location.assign("/");
			}
		}
		return Promise.reject(error);
	},
);
