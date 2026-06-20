import { Suspense } from "react";

import type { Metadata } from "next";

import { MediaOutletsList } from "@/components/pages/AdminMediaOutlets/MediaOutletsList";
import Text from "@/components/Text";

export const metadata: Metadata = {
	title: "Media outlets — Admin — Spotlight",
	description: "Manage media outlets in Spotlight.",
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
