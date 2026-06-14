import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { OpportunityDetail } from "@/components/opportunity-detail";
import { getAllOpportunityIds, getOpportunity } from "@/lib/opportunities";

type OpportunityPageProps = {
	params: Promise<{ pk: string }>;
};

export async function generateStaticParams() {
	return getAllOpportunityIds().map((pk) => ({ pk }));
}

export async function generateMetadata({
	params,
}: OpportunityPageProps): Promise<Metadata> {
	const { pk } = await params;
	const opportunity = getOpportunity(pk);

	if (!opportunity) {
		return { title: "Opportunity not found — Spotlight" };
	}

	return {
		title: `${opportunity.title} — Spotlight`,
		description: opportunity.description,
	};
}

export default async function OpportunityPage({
	params,
}: OpportunityPageProps) {
	const { pk } = await params;
	const opportunity = getOpportunity(pk);

	if (!opportunity) {
		notFound();
	}

	return <OpportunityDetail opportunity={opportunity} />;
}
