import { Suspense } from "react";

import type { Metadata } from "next";

import { ApplyContent } from "@/components/apply-content";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Apply- ${TRADING_NAME}`,
	description: `Submit an application for a media opportunity on ${TRADING_NAME}.`,
};

export default function ApplyPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-white px-6 py-16">
					<Text variant="loading">Preparing application…</Text>
				</div>
			}
		>
			<ApplyContent />
		</Suspense>
	);
}
