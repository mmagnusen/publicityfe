import { Suspense } from "react";

import type { Metadata } from "next";

import { WaitlistEntriesList } from "@/components/pages/AdminWaitlist/WaitlistEntriesList";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Waitlist- Admin- ${TRADING_NAME}`,
	description: `View waitlist signups in ${TRADING_NAME}.`,
};

export default function AdminWaitlistPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
					<Text variant="loading">Loading waitlist…</Text>
				</div>
			}
		>
			<WaitlistEntriesList />
		</Suspense>
	);
}
