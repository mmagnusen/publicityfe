import { Suspense } from "react";

import type { Metadata } from "next";

import { TagsList } from "@/components/pages/AdminTags/TagsList";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Tags- Admin- ${TRADING_NAME}`,
	description: `Manage tags in ${TRADING_NAME}.`,
};

export default function AdminTagsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
					<Text variant="loading">Loading tags…</Text>
				</div>
			}
		>
			<TagsList />
		</Suspense>
	);
}
