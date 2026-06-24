import { Suspense } from "react";

import type { Metadata } from "next";

import { PricingConfirmationContent } from "@/components/pricing-confirmation-content";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Payment confirmation- ${TRADING_NAME}`,
	description: `Your ${TRADING_NAME} subscription payment confirmation.`,
};

export default function PricingConfirmationPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center px-6 py-16">
					<Text variant="loading">Loading confirmation…</Text>
				</div>
			}
		>
			<PricingConfirmationContent />
		</Suspense>
	);
}
