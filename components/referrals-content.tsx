"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import { DashboardReferralsSection } from "@/components/dashboard-referrals-section";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";

export function ReferralsContent() {
	const router = useRouter();
	const { authenticationChecked, authenticatedUser, isLoggedIn } =
		useAuthenticatedUser();

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	if (!authenticationChecked) {
		return (
			<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
				<Text variant="loading">Loading referrals…</Text>
			</div>
		);
	}

	if (!isLoggedIn || !authenticatedUser) {
		return null;
	}

	return (
		<SidebarLayout>
			<Heading level={1} variant="page-lg">
				Referrals
			</Heading>
			<Text variant="page-subtitle">
				Invite friends and track referral credits you have earned.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<Heading level={2} variant="subsection">
					Referral history
				</Heading>
				<Text variant="card-body" className="mt-2">
					A full list of people who signed up with your code will appear here
					soon.
				</Text>
			</div>

			<DashboardReferralsSection
				className="mt-8"
				fallbackReferralCode={authenticatedUser.referral_code}
				isLoggedIn={isLoggedIn}
				showViewAllLink={false}
			/>
		</SidebarLayout>
	);
}
