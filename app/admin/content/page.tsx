import { Suspense } from "react";

import type { Metadata } from "next";

import { ContentList } from "@/components/pages/AdminContent/ContentList";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Content templates- Admin- ${TRADING_NAME}`,
	description: `Manage content templates in ${TRADING_NAME}.`,
};

export default function AdminContentPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
					<Text variant="loading">Loading content…</Text>
				</div>
			}
		>
			<ContentList />
		</Suspense>
	);
}
