import { Suspense } from "react";

import type { Metadata } from "next";

import { MediaOutletsList } from "@/components/pages/AdminMediaOutlets/MediaOutletsList";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Media outlets- Admin- ${TRADING_NAME}`,
	description: `Manage media outlets in ${TRADING_NAME}.`,
};

export default function AdminMediaOutletsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
					<Text variant="loading">Loading media outlets…</Text>
				</div>
			}
		>
			<MediaOutletsList />
		</Suspense>
	);
}
