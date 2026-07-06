"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { EditOpportunityContent } from "./EditOpportunityContent";

type EditOpportunityProps = {
	backHref?: string;
	successRedirectHref?: string;
};

export function EditOpportunity({
	backHref = "/opportunity",
	successRedirectHref = "/dashboard",
}: EditOpportunityProps = {}) {
	const router = useRouter();
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);

	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	if (authenticationChecked && !isLoggedIn) {
		return null;
	}

	if (authenticationChecked && isLoggedIn && !isAdmin) {
		return (
			<SidebarLayout>
				<Text variant="center-sm">
					You don&apos;t have permission to view this page.
				</Text>
			</SidebarLayout>
		);
	}

	if (!Number.isFinite(pk) || pk <= 0) {
		return (
			<SidebarLayout>
				<Text variant="center-sm">Invalid opportunity.</Text>
			</SidebarLayout>
		);
	}

	return (
		<SidebarLayout>
			<div className="mb-6">
				<Link
					href={backHref}
					className="text-sm font-medium text-gray-600 hover:text-black"
				>
					← Back to opportunities
				</Link>
			</div>

			<Heading level={1} variant="page-lg">
				Edit opportunity
			</Heading>
			<Text variant="page-subtitle">
				Update title and descriptions for this opportunity.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<EditOpportunityContent
					onDeleteSuccess={() => router.push(successRedirectHref)}
					onSubmitSuccess={() => router.push(successRedirectHref)}
					opportunityPk={pk}
				/>
			</div>
		</SidebarLayout>
	);
}
