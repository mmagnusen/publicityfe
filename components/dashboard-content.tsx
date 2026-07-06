"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeFavoriteOpportunitiesResponse,
	normalizeOpportunityListResponse,
	useMyFavouriteOpportunities,
	useMyOpportunities,
} from "@hooks/useOpportunities";

import Button from "@/components/Button";
import { DashboardAddOpportunitySection } from "@/components/dashboard-add-opportunity-section";
import { DashboardBillingSupport } from "@/components/dashboard-billing-support";
import { DashboardReferralsSection } from "@/components/dashboard-referrals-section";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { profilePagePath } from "@/lib/publicUser";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

function DashboardStatLink({
	href,
	label,
	value,
}: {
	href: string;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<Link
			className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300 hover:bg-gray-50/50"
			href={href}
		>
			<Text variant="stat-label">{label}</Text>
			<Text variant="stat-value">{value}</Text>
			<span className="mt-4 text-sm font-semibold text-violet-700">
				View all
			</span>
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

			<div className="mt-8 grid gap-4 sm:grid-cols-3">
				<DashboardStatLink
					href="/my-opportunities"
					label="My opportunities"
					value={isLoading && !data ? "…" : list.count}
				/>
				<DashboardStatLink
					href="/applications"
					label="Applications"
					value={0}
				/>
				<DashboardStatLink
					href="/favourites"
					label="My favourites"
					value={
						isLoadingFavourites && !favouritesData ? "…" : favouritesList.count
					}
				/>
			</div>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<Heading level={2} variant="subsection">
					Quick links
				</Heading>
				<div className="mt-4 flex flex-wrap gap-3">
					<Button href="/opportunity" textTransform="none">
						Browse opportunities
					</Button>
					{authenticatedUser.username?.trim() ? (
						<Button
							href={profilePagePath(authenticatedUser.username)}
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							View your profile
						</Button>
					) : null}
				</div>
			</div>

			<DashboardAddOpportunitySection />

			<DashboardReferralsSection
				fallbackReferralCode={authenticatedUser.referral_code}
				isLoggedIn={isLoggedIn}
			/>

			{isPricingReleased ? (
				<DashboardBillingSupport
					hasActiveSubscription={hasActiveSubscription}
				/>
			) : null}
		</SidebarLayout>
	);
}
