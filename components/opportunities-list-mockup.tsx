"use client";

import { useMemo } from "react";
import {
	mdiAccountOutline,
	mdiExitToApp,
	mdiHeartOutline,
	mdiInboxArrowDownOutline,
	mdiMagnify,
	mdiPlusCircleOutline,
	mdiViewDashboardOutline,
} from "@mdi/js";
import Icon from "@mdi/react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeOpportunityListResponse,
	useOpportunities,
} from "@hooks/useOpportunities";

import Heading from "@/components/Heading";
import { OpportunityCardWithCreator } from "@/components/opportunities-list";
import {
	DASHBOARD_HEADER_HEIGHT,
	DESKTOP_SIDEBAR_WIDTH,
} from "@/components/Sidebar/constants";
import { SectionHeader } from "@/components/Sidebar/SectionHeader";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";
import { cn } from "@/lib/cn";

const PREVIEW_OPPORTUNITIES_COUNT = 3;

function ChevronDownIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-4 shrink-0 text-gray-400"
			aria-hidden
		>
			<path
				d="M4 6l4 4 4-4"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function MockFilterField({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<span className="mb-2 block text-sm font-medium text-gray-900">
				{label}
			</span>
			<div className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-600">
				<span className="min-w-0 flex-1 truncate">{value}</span>
				<ChevronDownIcon />
			</div>
		</div>
	);
}

function MockOpportunityListFilters() {
	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_220px] lg:items-start">
				<div className="min-w-0 md:col-span-2 lg:col-span-1">
					<MockFilterField label="Filter by tag" value="Search by tag…" />
				</div>
				<MockFilterField label="Applied status" value="All opportunities" />
				<MockFilterField label="Sort by" value="Newest first" />
			</div>
		</div>
	);
}

function MockSidebarNavLink({
	children,
	icon,
	isActive = false,
}: {
	children: React.ReactNode;
	icon: string;
	isActive?: boolean;
}) {
	return (
		<span
			className={cn(
				"flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium",
				isActive ? "bg-gray-100 text-black" : "text-gray-600",
			)}
		>
			<span className="flex size-5 shrink-0 items-center justify-center">
				<Icon horizontal path={icon} rotate={180} size={0.85} vertical />
			</span>
			<span className="min-w-0">{children}</span>
		</span>
	);
}

function MockSidebar() {
	return (
		<aside
			className="hidden shrink-0 border-r border-gray-200 bg-white md:block"
			style={{ width: DESKTOP_SIDEBAR_WIDTH }}
		>
			<div className="pb-12">
				<section className="mb-8 px-4">
					<SectionHeader className="py-2" title="Overview" />
					<ul className="list-none">
						<li className="py-1">
							<MockSidebarNavLink icon={mdiViewDashboardOutline}>
								Dashboard
							</MockSidebarNavLink>
						</li>
					</ul>
				</section>

				<section className="mb-8 px-4">
					<SectionHeader className="py-2" title="Opportunities" />
					<ul className="list-none">
						<li className="py-1">
							<MockSidebarNavLink icon={mdiPlusCircleOutline}>
								Post an opportunity
							</MockSidebarNavLink>
						</li>
						<li className="py-1">
							<MockSidebarNavLink icon={mdiInboxArrowDownOutline}>
								Applications received
							</MockSidebarNavLink>
						</li>
						<li className="py-1">
							<MockSidebarNavLink icon={mdiMagnify} isActive>
								Browse opportunities
							</MockSidebarNavLink>
						</li>
						<li className="py-1">
							<MockSidebarNavLink icon={mdiHeartOutline}>
								My favourites
							</MockSidebarNavLink>
						</li>
					</ul>
				</section>

				<section className="mb-8 px-4">
					<SectionHeader className="py-2" title="My account" />
					<ul className="list-none">
						<li className="py-1">
							<MockSidebarNavLink icon={mdiAccountOutline}>
								View profile
							</MockSidebarNavLink>
						</li>
					</ul>
				</section>

				<section className="px-4">
					<ul className="list-none">
						<li className="mt-4 border-t border-gray-200 pt-4">
							<span className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-gray-600">
								<span className="flex size-5 shrink-0 items-center justify-center">
									<Icon
										horizontal
										path={mdiExitToApp}
										rotate={180}
										size={0.85}
										vertical
									/>
								</span>
								Sign out
							</span>
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
				<div className="flex items-center gap-2.5">
					<div className="flex size-8 items-center justify-center rounded-lg bg-black">
						<svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
							<path
								d="M3 11L6.5 7.5L9 9.5L13 4"
								stroke="white"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<span className="text-lg font-semibold tracking-tight text-black">
						{TRADING_NAME}
					</span>
				</div>
				<div className="flex items-center gap-3 sm:gap-4">
					<span className="hidden rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white md:inline-flex">
						Post an opportunity
					</span>
					<span className="hidden text-sm text-gray-600 md:inline">
						{authenticatedUser?.firstName ?? "Guest"}
					</span>
				</div>
			</div>
		</header>
	);
}

export function OpportunitiesListMockup() {
	const { data, error, isLoading } = useOpportunities(
		1,
		PREVIEW_OPPORTUNITIES_COUNT,
	);
	const list = useMemo(() => normalizeOpportunityListResponse(data), [data]);

	return (
		<div
			aria-hidden
			className="pointer-events-none mx-auto select-none overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-xl shadow-gray-200/60"
		>
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
						<MockOpportunityListFilters />
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
									<div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-gray-50 to-transparent" />
								) : null}
							</>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
