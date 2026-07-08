"use client";

import { useMemo, useState } from "react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import type {
	OpportunityListAppliedFilter,
	OpportunityListSort,
} from "@hooks/useOpportunities";
import {
	normalizeOpportunityListResponse,
	useOpportunities,
} from "@hooks/useOpportunities";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { LogoLink } from "@/components/Navigation/LogoLink";
import { OpportunityCardWithCreator } from "@/components/opportunities-list";
import { OpportunityListFilters } from "@/components/opportunity-tag-filter";
import {
	DASHBOARD_HEADER_HEIGHT,
	DESKTOP_SIDEBAR_WIDTH,
} from "@/components/Sidebar/constants";
import { SectionHeader } from "@/components/Sidebar/SectionHeader";
import Text from "@/components/Text";
import { cn } from "@/lib/cn";

const PREVIEW_OPPORTUNITIES_COUNT = 3;

function MockSidebarNavLink({
	children,
	isActive = false,
}: {
	children: React.ReactNode;
	isActive?: boolean;
}) {
	return (
		<span
			className={cn(
				"block rounded-md px-4 py-2 text-sm font-medium",
				isActive ? "bg-gray-100 text-black" : "text-gray-600",
			)}
		>
			{children}
		</span>
	);
}

function MockSidebar() {
	return (
		<aside
			className="hidden shrink-0 border-r border-gray-200 bg-white sm:block"
			style={{ width: DESKTOP_SIDEBAR_WIDTH }}
		>
			<div className="px-4 py-4">
				<section className="mb-8">
					<SectionHeader title="Overview" />
					<ul className="mt-1 list-none">
						<li className="py-1">
							<MockSidebarNavLink>Dashboard</MockSidebarNavLink>
						</li>
					</ul>
				</section>

				<section className="mb-8">
					<SectionHeader title="Opportunities" />
					<ul className="mt-1 list-none">
						<li className="py-1">
							<MockSidebarNavLink>Post an opportunity</MockSidebarNavLink>
						</li>
						<li className="py-1">
							<MockSidebarNavLink isActive>
								Browse opportunities
							</MockSidebarNavLink>
						</li>
						<li className="py-1">
							<MockSidebarNavLink>My favourites</MockSidebarNavLink>
						</li>
					</ul>
				</section>

				<section>
					<SectionHeader title="My account" />
					<ul className="mt-1 list-none">
						<li className="py-1">
							<MockSidebarNavLink>View profile</MockSidebarNavLink>
						</li>
					</ul>
				</section>
			</div>
		</aside>
	);
}

function MockDashboardHeader() {
	const { authenticatedUser } = useAuthenticatedUser();

	return (
		<header
			className="border-b border-gray-200 bg-white"
			style={{ height: DASHBOARD_HEADER_HEIGHT }}
		>
			<div className="flex h-full items-center justify-between px-6">
				<LogoLink />
				<div className="flex items-center gap-3 sm:gap-4">
					<Button
						className="hidden sm:inline-flex"
						href="/create-opportunity"
						size="small"
						textTransform="none"
					>
						Post an opportunity
					</Button>
					{authenticatedUser?.firstName ? (
						<span className="hidden text-sm text-gray-600 sm:inline">
							{authenticatedUser.firstName}
						</span>
					) : (
						<span className="hidden text-sm text-gray-400 sm:inline">
							Guest
						</span>
					)}
				</div>
			</div>
		</header>
	);
}

export function OpportunitiesListMockup() {
	const { isLoggedIn } = useAuthenticatedUser();
	const [selectedTagPks, setSelectedTagPks] = useState<number[]>([]);
	const [selectedSort, setSelectedSort] =
		useState<OpportunityListSort>("newest");
	const [selectedApplied, setSelectedApplied] =
		useState<OpportunityListAppliedFilter>("");

	const { data, error, isLoading } = useOpportunities(
		1,
		PREVIEW_OPPORTUNITIES_COUNT,
		selectedTagPks,
		selectedSort,
		selectedApplied,
	);
	const list = useMemo(() => normalizeOpportunityListResponse(data), [data]);

	return (
		<div className="mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-xl shadow-gray-200/60">
			<MockDashboardHeader />
			<div className="flex">
				<MockSidebar />
				<main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
					<div>
						<Heading level={1} variant="page-lg">
							Opportunities
						</Heading>
						<Text variant="page-subtitle">
							Browse media opportunities matched to your profile.
						</Text>
					</div>

					<div className="mt-6">
						<OpportunityListFilters
							onSelectedAppliedChange={setSelectedApplied}
							onSelectedSortChange={setSelectedSort}
							onSelectedTagPksChange={setSelectedTagPks}
							selectedApplied={selectedApplied}
							selectedSort={selectedSort}
							selectedTagPks={selectedTagPks}
							showAppliedFilter={isLoggedIn}
						/>
					</div>

					<div className="relative mt-8">
						{isLoading && !data ? (
							<div className="rounded-2xl border border-gray-200 bg-white p-6">
								<Text variant="loading">Loading opportunities…</Text>
							</div>
						) : error ? (
							<div className="rounded-2xl border border-gray-200 bg-white p-6">
								<Text variant="error">
									Could not load opportunities right now.
								</Text>
							</div>
						) : list.results.length === 0 ? (
							<div className="rounded-2xl border border-gray-200 bg-white p-6">
								<Text variant="center-sm">
									No opportunities available right now.
								</Text>
							</div>
						) : (
							<>
								<Text variant="stat-label">
									{list.count} opportunit{list.count === 1 ? "y" : "ies"}
								</Text>
								<ul className="mt-4 list-none space-y-4">
									{list.results.map((api) => (
										<li key={api.pk}>
											<OpportunityCardWithCreator api={api} />
										</li>
									))}
								</ul>
								{list.count > PREVIEW_OPPORTUNITIES_COUNT ? (
									<div
										aria-hidden
										className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-gray-50 to-transparent"
									/>
								) : null}
							</>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
