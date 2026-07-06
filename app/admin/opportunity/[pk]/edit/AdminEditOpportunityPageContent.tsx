"use client";

import { useParams } from "next/navigation";

import { EditOpportunity } from "@/components/pages/Opportunities/EditOpportunity";

export function AdminEditOpportunityPageContent() {
	const params = useParams<{ pk: string }>();
	const pk = params.pk;

	return (
		<EditOpportunity
			backHref={`/admin/opportunity/${pk}`}
			successRedirectHref={`/admin/opportunity/${pk}`}
		/>
	);
}
