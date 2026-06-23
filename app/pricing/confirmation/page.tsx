import { Suspense } from "react";

import type { Metadata } from "next";

import { PricingConfirmationContent } from "@/components/pricing-confirmation-content";
import Text from "@/components/Text";

export const metadata: Metadata = {
	title: "Payment confirmation — Spotlight",
	description: "Your Spotlight subscription payment confirmation.",
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
