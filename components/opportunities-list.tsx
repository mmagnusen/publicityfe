"use client";

import { useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeOpportunityListResponse,
	OPPORTUNITIES_PER_PAGE,
	useOpportunities,
} from "@hooks/useOpportunities";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { Navigation } from "@/components/Navigation";
import { OpportunityFavouriteToggle } from "@/components/OpportunityFavouriteToggle";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import {
	mapApiOpportunitiesToDisplay,
	type Opportunity,
} from "@/lib/opportunities";

function ListPagination({
	currentPage,
	totalCount,
}: {
	currentPage: number;
	totalCount: number;
}) {
	const totalPages = Math.max(
		1,
		Math.ceil(totalCount / OPPORTUNITIES_PER_PAGE),
	);

	if (totalPages <= 1) {
		return null;
	}

	const prevHref =
		currentPage > 1 ? `/opportunity?page=${currentPage - 1}` : undefined;
	const nextHref =
		currentPage < totalPages
			? `/opportunity?page=${currentPage + 1}`
			: undefined;

	return (
		<div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
			<Text variant="caption">
				Page {currentPage} of {totalPages}
			</Text>
			<div className="flex gap-2">
				{prevHref ? (
					<Link
						href={prevHref}
						className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-gray-50"
					>
						Previous
					</Link>
				) : (
					<span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
						Previous
					</span>
				)}
				{nextHref ? (
					<Link
						href={nextHref}
						className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-gray-50"
					>
						Next
					</Link>
				) : (
					<span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
						Next
					</span>
				)}
			</div>
		</div>
	);
}

export function OpportunityCard({
	opportunity,
	showEdit,
}: {
	opportunity: Opportunity;
	showEdit?: boolean;
}) {
	const isOpen = opportunity.status === "open";

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="relative min-w-0 flex-1">
				<div className="absolute right-4 top-4 z-10">
					<OpportunityFavouriteToggle
						isFavorited={opportunity.isFavorited}
						opportunityId={Number(opportunity.id)}
					/>
				</div>
				<Link
					href={`/opportunity/${opportunity.id}`}
					className="block rounded-2xl border border-gray-200 bg-white p-6 pr-16 transition-colors hover:border-gray-300 hover:bg-gray-50/50"
				>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
									{opportunity.type}
								</span>
								<span
									className={
										isOpen
											? "inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700"
											: "inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600"
									}
								>
									<span
										className={
											isOpen
												? "size-1.5 rounded-full bg-green-500"
												: "size-1.5 rounded-full bg-gray-400"
										}
									/>
									{isOpen ? "Open" : "Closed"}
								</span>
							</div>

							<Heading level={2} variant="subsection" className="mt-3">
								{opportunity.title}
							</Heading>

							<Text variant="card-body" className="mt-2 line-clamp-2">
								{opportunity.shortDescription}
							</Text>

							<div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
								<span>{opportunity.publication.name}</span>
								<span aria-hidden>·</span>
								<span>
									{opportunity.hasApplicationDeadline
										? `Apply by ${opportunity.deadline}`
										: "Ongoing — no application deadline"}
								</span>
							</div>
						</div>

						<div className="shrink-0 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-center sm:min-w-[7rem]">
							<Text variant="detail-label">Match</Text>
							<p className="mt-1 text-2xl font-bold text-violet-600">
								{opportunity.matchScore}%
							</p>
						</div>
					</div>
				</Link>
			</div>

			{showEdit ? (
				<Button
					href={`/opportunity/${opportunity.id}/edit`}
					size="small"
					strVariant="transparentWithBorder"
					textTransform="none"
				>
					Edit
				</Button>
			) : null}
		</div>
	);
}

export function OpportunitiesList() {
	const searchParams = useSearchParams();
	const { authenticationChecked, isLoggedIn } = useAuthenticatedUser();

	const pageFromQuery = Number(searchParams.get("page")) || 1;
	const currentPage = pageFromQuery >= 1 ? pageFromQuery : 1;

	const { data, error, isLoading } = useOpportunities(currentPage);
	const list = useMemo(() => normalizeOpportunityListResponse(data), [data]);
	const opportunities = useMemo(
		() => mapApiOpportunitiesToDisplay(list.results),
		[list.results],
	);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	const listContent = (
		<>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<Heading level={1} variant="page-lg">
						Opportunities
					</Heading>
					<Text variant="page-subtitle">
						Browse media opportunities matched to your profile.
					</Text>
				</div>
			</div>

			<div className="mt-8">
				{isLoading && !data ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="loading">Loading opportunities…</Text>
					</div>
				) : error ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="error">
							{accessDenied
								? "Could not load opportunities. You may not have permission to view this page."
								: "Could not load opportunities. Check the API is available and try again."}
						</Text>
					</div>
				) : opportunities.length === 0 ? (
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
							{opportunities.map((opportunity) => (
								<li key={opportunity.id}>
									<OpportunityCard opportunity={opportunity} />
								</li>
							))}
						</ul>
						<ListPagination currentPage={currentPage} totalCount={list.count} />
					</>
				)}
			</div>
		</>
	);

	if (!authenticationChecked) {
		return (
			<div className="min-h-full bg-gray-50 font-sans">
				<main className="mx-auto max-w-6xl px-6 py-10">{listContent}</main>
			</div>
		);
	}

	if (isLoggedIn) {
		return <SidebarLayout>{listContent}</SidebarLayout>;
	}

	return (
		<div className="min-h-full bg-gray-50 font-sans">
			<Navigation isLoggedIn={false} />
			<main className="mx-auto max-w-6xl px-6 py-10">{listContent}</main>
		</div>
	);
}
