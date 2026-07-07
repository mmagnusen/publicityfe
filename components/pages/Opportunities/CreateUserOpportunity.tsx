"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	createUserOpportunity,
	revalidateOpportunityLists,
} from "@hooks/useOpportunities";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";
import { CREATE_OPPORTUNITY_AUTHENTICATE_PATH } from "./CreateOpportunityAuthenticate";
import { OpportunityForm } from "./OpportunityForm";
import {
	defaultOpportunityFormValues,
	formValuesToCreatePayload,
	type OpportunityFormValues,
} from "./opportunityFormValues";

export function CreateUserOpportunity() {
	const router = useRouter();
	const { authenticationChecked, isLoggedIn } = useAuthenticatedUser();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const initialValues = useMemo(() => defaultOpportunityFormValues(), []);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace(CREATE_OPPORTUNITY_AUTHENTICATE_PATH);
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: OpportunityFormValues) => {
		setIsSubmitting(true);
		try {
			await createUserOpportunity(formValuesToCreatePayload(values));
			await revalidateOpportunityLists();
			await router.push("/my-opportunities");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!authenticationChecked || !isLoggedIn) {
		return null;
	}

	return (
		<SidebarLayout>
			<div className="mb-6">
				<Link
					href="/dashboard"
					className="text-sm font-medium text-gray-600 hover:text-black"
				>
					← Back to dashboard
				</Link>
			</div>

			<Heading level={1} variant="page-lg">
				Post an opportunity
			</Heading>
			<Text variant="page-subtitle">
				Share a media opportunity with {TRADING_NAME} members.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<OpportunityForm
					initialValues={initialValues}
					isSubmitting={isSubmitting}
					onSubmit={handleSubmit}
					submitLabel="Post opportunity"
				/>
			</div>
		</SidebarLayout>
	);
}
