import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { instanceAxios } from "@util/instanceAxios";
import {
	getPromoCodeFromCookie,
	setPromoCodeCookie,
} from "@util/promoCodeCookie";
import type { ParsedUrlQuery } from "querystring";

const DEFAULT_QUERY_PARAM = "promo_code";

/**
 * Reads a trimmed promo code from the router query (handles string | string[]).
 */
export const getPromoCodeFromQuery = (
	query: ParsedUrlQuery,
	paramKey: string = DEFAULT_QUERY_PARAM,
): string | undefined => {
	const raw = query[paramKey];
	const value = Array.isArray(raw) ? raw[0] : raw;
	if (typeof value !== "string" || !value.trim()) return undefined;
	return value.trim();
};

/**
 * URL query wins over cookie (same rules as registration flows).
 */
export const resolvePromoCodeForRegistration = (
	query: ParsedUrlQuery,
	paramKey: string = DEFAULT_QUERY_PARAM,
): string | undefined => {
	return getPromoCodeFromQuery(query, paramKey) ?? getPromoCodeFromCookie();
};

/**
 * If `promo_code` is present in the URL query, persist it to the promo cookie.
 * Call from `_app` on mount / route change so attribution works on every page.
 */
export const syncPromoCodeQueryToCookie = (
	query: ParsedUrlQuery,
	paramKey: string = DEFAULT_QUERY_PARAM,
): void => {
	const code = getPromoCodeFromQuery(query, paramKey);
	if (code) {
		setPromoCodeCookie(code);
	}
};

/** Successful `/billing/validate-promo` response body (when `valid` is true). */
export type PromoValidatedDetails = {
	amount_payable_pence: number;
	code: string;
	description: string;
	discount_kind: string;
	discount_pence: number;
	duration_months: number;
	error: string | null;
	list_price_pence: number;
	plan_pk: number;
	promo_pk: number;
	requires_payment: boolean;
};

export type PromoCodeValidationResult =
	| ({ valid: true } & PromoValidatedDetails)
	| { valid: false };

type ValidatePromoApiResponse = {
	valid?: boolean;
	amount_payable_pence?: number;
	code?: string;
	description?: string;
	discount_kind?: string;
	discount_pence?: number;
	duration_months?: number;
	error?: string | null;
	list_price_pence?: number;
	plan_pk?: number;
	promo_pk?: number;
	requires_payment?: boolean;
};

const mapValidPromoResponse = (
	data: ValidatePromoApiResponse,
): PromoValidatedDetails => {
	return {
		amount_payable_pence: Number(data.amount_payable_pence ?? 0),
		code: typeof data.code === "string" ? data.code : "",
		description: typeof data.description === "string" ? data.description : "",
		discount_kind:
			typeof data.discount_kind === "string" ? data.discount_kind : "",
		discount_pence: Number(data.discount_pence ?? 0),
		duration_months: Number(data.duration_months ?? 0),
		error: data.error === undefined ? null : data.error,
		list_price_pence: Number(data.list_price_pence ?? 0),
		plan_pk: Number(data.plan_pk ?? 0),
		promo_pk: Number(data.promo_pk ?? 0),
		requires_payment: Boolean(data.requires_payment),
	};
};

/**
 * Calls the public validate API. Does not throw on HTTP errors- returns `{ valid: false }`.
 */
export const validatePromoCode = async (
	promoCode: string,
	/** Billing plan id (URL `/pricing/payment/:planId`). Defaults to paid plan `1` for registration flows. */
	planId: number = 1,
): Promise<PromoCodeValidationResult> => {
	const trimmed = promoCode.trim();
	if (!trimmed) return { valid: false };

	try {
		const { data } = await instanceAxios<ValidatePromoApiResponse>({
			method: "post",
			url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/billing/validate-promo`,
			data: { promo_code: trimmed, plan_id: planId },
		});

		if (!data || data.valid !== true) {
			return { valid: false };
		}

		return {
			valid: true,
			...mapValidPromoResponse(data),
		};
	} catch {
		return { valid: false };
	}
};

export type PromoValidationState =
	| { status: "idle" }
	| { status: "loading" }
	| ({ status: "success" } & PromoValidatedDetails)
	| { status: "error" };

export type UsePromoCodeOptions = {
	/**
	 * When true, persist `queryParam` from the URL to the promo cookie (default: false).
	 * Prefer global capture in `_app` via `syncPromoCodeQueryToCookie` instead of duplicating here.
	 */
	captureFromQuery?: boolean;
	/** When true, validate the resolved promo code (query → cookie) and expose `validation` (default: false). */
	validate?: boolean;
	/**
	 * When true with `validate`, only run validation if `queryParam` is present in the URL- not when the code exists only in the cookie (default: false).
	 */
	validateOnlyFromQuery?: boolean;
	/** Query string key (default: `promo_code`). */
	queryParam?: string;
};

export const usePromoCode = (options: UsePromoCodeOptions = {}) => {
	const {
		captureFromQuery = false,
		validate = false,
		validateOnlyFromQuery = false,
		queryParam = "promo_code",
	} = options;

	const router = useRouter();
	const [validation, setValidation] = useState<PromoValidationState>({
		status: "idle",
	});

	useEffect(() => {
		if (!captureFromQuery || !router.isReady) return;

		const code = getPromoCodeFromQuery(router.query, queryParam);
		if (code) {
			setPromoCodeCookie(code);
		}
	}, [captureFromQuery, router.isReady, router.query, queryParam]);

	useEffect(() => {
		if (!validate || !router.isReady) return;

		const promoCode = validateOnlyFromQuery
			? getPromoCodeFromQuery(router.query, queryParam)
			: resolvePromoCodeForRegistration(router.query, queryParam);
		if (!promoCode) {
			setValidation({ status: "idle" });
			return;
		}

		let cancelled = false;
		setValidation({ status: "loading" });

		(async () => {
			const result = await validatePromoCode(promoCode, 1);
			if (cancelled) return;
			if (result.valid) {
				const { valid: _valid, ...details } = result;
				setValidation({
					status: "success",
					...details,
				});
			} else {
				setValidation({ status: "error" });
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [
		validate,
		validateOnlyFromQuery,
		router.isReady,
		router.query,
		queryParam,
	]);

	const resolvedPromoCode = router.isReady
		? resolvePromoCodeForRegistration(router.query, queryParam)
		: undefined;

	return {
		/** Query param first, then cookie; undefined until router is ready. */
		resolvedPromoCode,
		/** Only meaningful when `validate: true`. */
		validation,
		/** Validate an arbitrary code (e.g. manual input). */
		validatePromoCode,
	};
};
