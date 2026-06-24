export const TRADING_NAME = process.env.NEXT_PUBLIC_TRADING_NAME?.trim() ?? "";

/** e.g. `"Dashboard"` → `"Dashboard- Get featured"` */
export function tradingNamePageTitle(pageTitle: string): string {
	if (!TRADING_NAME) {
		return pageTitle;
	}

	return `${pageTitle}- ${TRADING_NAME}`;
}
