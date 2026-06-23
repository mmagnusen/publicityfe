"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeOpportunityListResponse,
	useMyOpportunities,
} from "@hooks/useOpportunities";

import Button from "@/components/Button";
import { DashboardBillingSupport } from "@/components/dashboard-billing-support";
import { DashboardReferralsSection } from "@/components/dashboard-referrals-section";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { mapApiOpportunitiesToDisplay } from "@/lib/opportunities";
import { profilePagePath } from "@/lib/publicUser";

export function DashboardContent() {
	const router = useRouter();
	const {
		authenticationChecked,
		authenticatedUser,
		hasActiveSubscription,
		isAdmin,
		isLoggedIn,
	} = useAuthenticatedUser();
	const { data, error, isLoading } = useMyOpportunities(1);
	const list = useMemo(() => normalizeOpportunityListResponse(data), [data]);
	const myOpportunities = useMemo(
		() => mapApiOpportunitiesToDisplay(list.results),
		[list.results],
	);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

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
				<div className="rounded-2xl border border-gray-200 bg-white p-6">
					<Text variant="stat-label">My opportunities</Text>
					<Text variant="stat-value">
						{isLoading && !data ? "…" : list.count}
					</Text>
				</div>
				<div className="rounded-2xl border border-gray-200 bg-white p-6">
					<Text variant="stat-label">Applications</Text>
					<Text variant="stat-value">3</Text>
				</div>
				<div className="rounded-2xl border border-gray-200 bg-white p-6">
					<Text variant="stat-label">Profile views</Text>
					<Text variant="stat-value">48</Text>
				</div>
			</div>

			<DashboardReferralsSection
				fallbackReferralCode={authenticatedUser.referral_code}
				isLoggedIn={isLoggedIn}
			/>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<Heading level={2} variant="subsection">
							My opportunities
						</Heading>
						<Text variant="card-body" className="mt-1">
							Opportunities you have created.
						</Text>
					</div>
					{isAdmin ? (
						<Button href="/opportunity/create" textTransform="none">
							New opportunity
						</Button>
					) : null}
				</div>

				<div className="mt-6">
					{isLoading && !data ? (
						<Text variant="loading">Loading your opportunities…</Text>
					) : error ? (
						<Text variant="error">
							{accessDenied
								? "Could not load your opportunities. You may not have permission."
								: "Could not load your opportunities. Try again later."}
						</Text>
					) : myOpportunities.length === 0 ? (
						<Text variant="center-sm">
							You haven&apos;t created any opportunities yet.
						</Text>
					) : (
						<ul className="list-none divide-y divide-gray-200">
							{myOpportunities.map((opportunity) => (
								<li
									key={opportunity.id}
									className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
								>
									<div className="min-w-0">
										<Link
											href={`/opportunity/${opportunity.id}`}
											className="font-semibold text-black transition-colors hover:text-violet-700"
										>
											{opportunity.title}
										</Link>
										<Text variant="card-body" className="mt-1 line-clamp-2">
											{opportunity.shortDescription}
										</Text>
										<p className="mt-2 text-sm text-gray-500">
											{opportunity.hasApplicationDeadline
												? `Apply by ${opportunity.deadline}`
												: "Ongoing — no application deadline"}
										</p>
									</div>
									{isAdmin ? (
										<Button
											href={`/opportunity/${opportunity.id}/edit`}
											size="small"
											strVariant="transparentWithBorder"
											textTransform="none"
										>
											Edit
										</Button>
									) : null}
								</li>
							))}
						</ul>
					)}
				</div>
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

			<DashboardBillingSupport hasActiveSubscription={hasActiveSubscription} />
		</SidebarLayout>
	);
}
