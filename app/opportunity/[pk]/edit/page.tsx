import type { Metadata } from "next";

import { EditOpportunity } from "@/components/pages/Opportunities/EditOpportunity";

export const metadata: Metadata = {
	title: "Edit opportunity — Spotlight",
	description: "Edit a media opportunity in Spotlight.",
};

export default function EditOpportunityPage() {
	return <EditOpportunity />;
}
