import type { Metadata } from "next";

import { PricingPageContent } from "@/components/pricing-page-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Pricing- ${TRADING_NAME}`,
	description:
		"Simple, transparent pricing for creators and businesses. Start free or upgrade to Pro for unlimited matches and premium features.",
};

export default function PricingPage() {
	return <PricingPageContent />;
}
