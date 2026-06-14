import {
	AUTHENTICATED_USER_COOKIE,
	AUTHENTICATED_USER_EMAIL_VERIFIED,
	AUTHENTICATED_USER_IDENTITY_VERIFIED,
	AUTHENTICATED_USER_PROFILE_PIC_URL,
} from "@constants/cookies";
import Cookies from "universal-cookie";

/** Dispatched when the JWT is expired so auth context can clear React state. */
export const SESSION_EXPIRED_EVENT = "delphi:session-expired";

const defaultCookies = new Cookies(null, { path: "/" });

export const clearAuthSessionCookies = (
	cookieStore: Cookies = defaultCookies,
): void => {
	try {
		cookieStore.remove(AUTHENTICATED_USER_COOKIE, { path: "/" });
		cookieStore.remove(AUTHENTICATED_USER_PROFILE_PIC_URL, { path: "/" });
		cookieStore.remove(AUTHENTICATED_USER_EMAIL_VERIFIED, { path: "/" });
		cookieStore.remove(AUTHENTICATED_USER_IDENTITY_VERIFIED, { path: "/" });
	} catch {
		/* ignore */
	}
};

export const notifySessionExpired = (): void => {
	if (typeof window === "undefined") {
		return;
	}
	window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
