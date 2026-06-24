import { Suspense } from "react";

import type { Metadata } from "next";

import { OpportunityDetailContent } from "@/components/opportunity-detail-content";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Opportunity- ${TRADING_NAME}`,
	description: `View a media opportunity on ${TRADING_NAME}.`,
};

export default function OpportunityPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-white px-6 py-16">
					<Text variant="loading">Loading opportunity…</Text>
				</div>
			}
		>
			<OpportunityDetailContent />
		</Suspense>
	);
}
