"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	createOpportunity,
	revalidateOpportunityLists,
} from "@hooks/useOpportunities";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { OpportunityForm } from "./OpportunityForm";
import {
	defaultOpportunityFormValues,
	formValuesToCreatePayload,
	type OpportunityFormValues,
} from "./opportunityFormValues";

export function CreateOpportunity() {
	const router = useRouter();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const initialValues = useMemo(() => defaultOpportunityFormValues(), []);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: OpportunityFormValues) => {
		setIsSubmitting(true);
		try {
			await createOpportunity(formValuesToCreatePayload(values));
			await revalidateOpportunityLists();
			await router.push("/opportunity");
		} finally {
			setIsSubmitting(false);
		}
	};

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

	return (
		<SidebarLayout>
			<div className="mb-6">
				<Link
					href="/opportunity"
					className="text-sm font-medium text-gray-600 hover:text-black"
				>
					← Back to opportunities
				</Link>
			</div>

			<Heading level={1} variant="page-lg">
				New opportunity
			</Heading>
			<Text variant="page-subtitle">
				Create a media opportunity for Spotlight users.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<OpportunityForm
					initialValues={initialValues}
					isSubmitting={isSubmitting}
					onSubmit={handleSubmit}
					submitLabel="Create opportunity"
				/>
			</div>
		</SidebarLayout>
	);
}
