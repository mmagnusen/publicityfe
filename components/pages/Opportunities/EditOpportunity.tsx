"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { useAllMediaOutlets } from "@hooks/useMediaOutlets";
import {
	deleteOpportunity,
	patchOpportunity,
	revalidateOpportunityDetailCaches,
	revalidateOpportunityLists,
	useAdminOpportunity,
} from "@hooks/useOpportunities";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { OpportunityForm } from "./OpportunityForm";
import {
	formValuesToUpdatePayload,
	type OpportunityFormValues,
	opportunityToFormValues,
} from "./opportunityFormValues";

export function EditOpportunity() {
	const router = useRouter();
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);

	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useAdminOpportunity(
		Number.isFinite(pk) && pk > 0 ? pk : null,
	);
	const { data: mediaOutlets } = useAllMediaOutlets();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const initialValues = useMemo(
		() => (data ? opportunityToFormValues(data, mediaOutlets) : null),
		[data, mediaOutlets],
	);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: OpportunityFormValues) => {
		if (!Number.isFinite(pk) || pk <= 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await patchOpportunity(pk, formValuesToUpdatePayload(values));
			await revalidateOpportunityDetailCaches(pk);
			await revalidateOpportunityLists();
			await router.push("/opportunity");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!Number.isFinite(pk) || pk <= 0) {
			return;
		}

		if (!window.confirm("Delete this opportunity? This cannot be undone.")) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteOpportunity(pk);
			await revalidateOpportunityLists();
			await router.push("/opportunity");
		} finally {
			setIsDeleting(false);
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
					href="/opportunity"
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
				{isLoading ? (
					<Text variant="loading">Loading opportunity…</Text>
				) : error || !data || !initialValues ? (
					<Text variant="error">
						Could not load this opportunity. It may not exist or you may not
						have permission to edit it.
					</Text>
				) : (
					<OpportunityForm
						key={pk}
						initialValues={initialValues}
						isDeleting={isDeleting}
						isSubmitting={isSubmitting}
						onDelete={handleDelete}
						onSubmit={handleSubmit}
						submitLabel="Save changes"
					/>
				)}
			</div>
		</SidebarLayout>
	);
}
