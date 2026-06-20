import type { Metadata } from "next";

import { CreateOpportunity } from "@/components/pages/Opportunities/CreateOpportunity";

export const metadata: Metadata = {
	title: "New opportunity — Spotlight",
	description: "Create a new media opportunity in Spotlight.",
};

export default function CreateOpportunityPage() {
	return <CreateOpportunity />;
}
