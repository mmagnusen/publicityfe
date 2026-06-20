import { Suspense } from "react";

import type { Metadata } from "next";

import { OpportunitiesList } from "@/components/opportunities-list";
import Text from "@/components/Text";

export const metadata: Metadata = {
	title: "Opportunities — Spotlight",
	description: "Browse media opportunities matched to your profile.",
};

export default function OpportunitiesPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
					<Text variant="loading">Loading opportunities…</Text>
				</div>
			}
		>
			<OpportunitiesList />
		</Suspense>
	);
}
