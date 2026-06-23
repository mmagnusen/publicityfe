import { Suspense } from "react";

import type { Metadata } from "next";

import { AdminOpportunitiesList } from "@/components/pages/AdminOpportunities/AdminOpportunitiesList";
import Text from "@/components/Text";

export const metadata: Metadata = {
	title: "All opportunities — Admin — Spotlight",
	description: "Manage opportunities in Spotlight.",
};

export default function AdminOpportunitiesPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
					<Text variant="loading">Loading opportunities…</Text>
				</div>
			}
		>
			<AdminOpportunitiesList />
		</Suspense>
	);
}
