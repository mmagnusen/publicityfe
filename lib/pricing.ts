export const DEFAULT_PAID_PLAN_ID = 1;

export function buildProPlanPaymentPath(
	planId: number = DEFAULT_PAID_PLAN_ID,
): string {
	return `/pricing/payment/${planId}`;
}

export function buildProPlanRegisterRedirect(
	planId: number = DEFAULT_PAID_PLAN_ID,
): string {
	const paymentPath = buildProPlanPaymentPath(planId);
	return `/register?redirect_url=${encodeURIComponent(paymentPath)}`;
}

export function buildProPlanCtaHref(
	isLoggedIn: boolean,
	planId: number = DEFAULT_PAID_PLAN_ID,
): string {
	return isLoggedIn
		? buildProPlanPaymentPath(planId)
		: buildProPlanRegisterRedirect(planId);
}
