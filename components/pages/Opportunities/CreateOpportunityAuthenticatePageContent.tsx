"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import {
	CREATE_OPPORTUNITY_PATH,
	CreateOpportunityAuthenticate,
} from "@/components/pages/Opportunities/CreateOpportunityAuthenticate";

export function CreateOpportunityAuthenticatePageContent() {
	const router = useRouter();
	const { authenticationChecked, isLoggedIn } = useAuthenticatedUser();

	useEffect(() => {
		if (authenticationChecked && isLoggedIn) {
			router.replace(CREATE_OPPORTUNITY_PATH);
		}
	}, [authenticationChecked, isLoggedIn, router]);

	if (!authenticationChecked || isLoggedIn) {
		return null;
	}

	return (
		<CreateOpportunityAuthenticate
			onSuccess={() => {
				router.push(CREATE_OPPORTUNITY_PATH);
			}}
		/>
	);
}
