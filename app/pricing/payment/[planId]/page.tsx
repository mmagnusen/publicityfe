import type { Metadata } from "next";

import { PricingPaymentContent } from "@/components/pricing-payment-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Checkout- ${TRADING_NAME}`,
	description: `Complete your ${TRADING_NAME} Pro subscription payment securely.`,
};

type Props = {
	params: Promise<{ planId: string }>;
};

export default async function PricingPaymentPage({ params }: Props) {
	const { planId } = await params;
	return <PricingPaymentContent planId={planId} />;
}
