"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeMyApplicationsResponse,
	useMyApplications,
} from "@hooks/useMyApplications";
import {
	normalizeFavoriteOpportunitiesResponse,
	normalizeOpportunityListResponse,
	useMyFavouriteOpportunities,
	useMyOpportunities,
} from "@hooks/useOpportunities";

import { DashboardAddOpportunitySection } from "@/components/dashboard-add-opportunity-section";
import { DashboardBillingSupport } from "@/components/dashboard-billing-support";
import { DashboardCompleteProfileSection } from "@/components/dashboard-complete-profile-section";
import { DashboardReferralsSection } from "@/components/dashboard-referrals-section";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

function DashboardStatLink({
	description,
	href,
	label,
	value,
}: {
	description: string;
	href: string;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<Link
			className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-gray-300 hover:bg-gray-50/50"
			href={href}
		>
			<div className="flex flex-1 items-center p-6 pb-4">
				<div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2">
					<Text
						variant="stat-value"
						className="mt-0 shrink-0 text-4xl leading-none tabular-nums"
					>
						{value}
					</Text>
					<div className="min-w-36">
						<p className="text-sm font-semibold text-black">{label}</p>
						<Text variant="card-body" className="mt-1 text-pretty">
							{description}
						</Text>
					</div>
				</div>
			</div>
			<div className="mt-auto px-6 pb-4">
				<div className="border-t border-gray-200 pt-4">
					<span className="text-sm font-semibold text-[#FF00AE]">View all</span>
				</div>
			</div>
		</Link>
	);
}

export function DashboardContent() {
	const router = useRouter();
	const {
		authenticationChecked,
		authenticatedUser,
		hasActiveSubscription,
		isLoggedIn,
	} = useAuthenticatedUser();
	const { data, isLoading } = useMyOpportunities(1);
	const list = useMemo(() => normalizeOpportunityListResponse(data), [data]);
	const { data: applicationsData, isLoading: isLoadingApplications } =
		useMyApplications(1);
	const applicationsList = useMemo(
		() => normalizeMyApplicationsResponse(applicationsData),
		[applicationsData],
	);
	const { data: favouritesData, isLoading: isLoadingFavourites } =
		useMyFavouriteOpportunities(1);
	const favouritesList = useMemo(
		() => normalizeFavoriteOpportunitiesResponse(favouritesData),
		[favouritesData],
	);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	if (!authenticationChecked) {
		return (
			<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
				<Text variant="loading">Loading your dashboard…</Text>
			</div>
		);
	}

	if (!isLoggedIn || !authenticatedUser) {
		return null;
	}

	return (
		<SidebarLayout>
			<Heading level={1} variant="page-lg">
				Welcome back, {authenticatedUser.firstName}
			</Heading>
			<Text variant="page-subtitle">
				Your dashboard for managing media opportunities and your profile.
			</Text>

			<div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,17.5rem),1fr))] gap-4">
				<DashboardStatLink
					description="Opportunities you've posted for others to apply to."
					href="/my-opportunities"
					label="My opportunities"
					value={isLoading && !data ? "…" : list.count}
				/>
				<DashboardStatLink
					description="Opportunities you've applied to."
					href="/applications"
					label="My applications"
					value={
						isLoadingApplications && !applicationsData
							? "…"
							: applicationsList.count
					}
				/>
				<DashboardStatLink
					description="Opportunities you've saved to revisit later."
					href="/favourites"
					label="My favourites"
					value={
						isLoadingFavourites && !favouritesData ? "…" : favouritesList.count
					}
				/>
			</div>

			{authenticatedUser.username?.trim() ? (
				<DashboardCompleteProfileSection
					username={authenticatedUser.username.trim()}
				/>
			) : null}

			<DashboardAddOpportunitySection />

			{isPricingReleased ? (
				<DashboardReferralsSection
					fallbackReferralCode={authenticatedUser.referral_code}
					isLoggedIn={isLoggedIn}
				/>
			) : null}

			{isPricingReleased ? (
				<DashboardBillingSupport
					hasActiveSubscription={hasActiveSubscription}
				/>
			) : null}
		</SidebarLayout>
	);
}
