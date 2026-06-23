import type { Metadata } from "next";

import { PricingPaymentContent } from "@/components/pricing-payment-content";

export const metadata: Metadata = {
	title: "Checkout — Spotlight",
	description: "Complete your Spotlight Pro subscription payment securely.",
};

type Props = {
	params: Promise<{ planId: string }>;
};

export default async function PricingPaymentPage({ params }: Props) {
	const { planId } = await params;
	return <PricingPaymentContent planId={planId} />;
}
