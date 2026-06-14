import { PROMO_CODE_COOKIE } from "@constants/cookies";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

/** How long we keep an attributed promo code (e.g. from a marketing link). */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const getPromoCodeFromCookie = (): string | undefined => {
	const v = cookies.get(PROMO_CODE_COOKIE);
	if (typeof v !== "string" || !v.trim()) return undefined;
	return v.trim();
};

export const setPromoCodeCookie = (code: string): void => {
	const trimmed = code.trim();
	if (!trimmed) return;
	cookies.set(PROMO_CODE_COOKIE, trimmed, {
		path: "/",
		maxAge: MAX_AGE_SECONDS,
	});
};

export const clearPromoCodeCookie = (): void => {
	cookies.remove(PROMO_CODE_COOKIE, { path: "/" });
};
