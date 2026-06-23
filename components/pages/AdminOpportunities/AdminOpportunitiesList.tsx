"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeOpportunityListResponse,
	OPPORTUNITIES_PER_PAGE,
	useAdminOpportunities,
} from "@hooks/useOpportunities";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { OpportunityCard } from "@/components/opportunities-list";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { mapApiOpportunitiesToDisplay } from "@/lib/opportunities";

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
		currentPage > 1
			? `/admin/opportunities?page=${currentPage - 1}`
			: undefined;
	const nextHref =
		currentPage < totalPages
			? `/admin/opportunities?page=${currentPage + 1}`
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

export function AdminOpportunitiesList() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();

	const pageFromQuery = Number(searchParams.get("page")) || 1;
	const currentPage = pageFromQuery >= 1 ? pageFromQuery : 1;

	const { data, error, isLoading } = useAdminOpportunities(currentPage);
	const list = useMemo(() => normalizeOpportunityListResponse(data), [data]);
	const opportunities = useMemo(
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

	return (
		<SidebarLayout>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<Heading level={1} variant="page-lg">
						All opportunities
					</Heading>
					<Text variant="page-subtitle">
						Manage every opportunity in Spotlight.
					</Text>
				</div>
				<Button href="/opportunity/create" textTransform="none">
					New opportunity
				</Button>
			</div>

			<div className="mt-8">
				{!authenticationChecked || (isLoading && !data) ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="loading">Loading opportunities…</Text>
					</div>
				) : error ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="error">
							{accessDenied
								? "Access denied. Sign in with a staff account to continue."
								: "Could not load opportunities. Check the API is available and try again."}
						</Text>
					</div>
				) : opportunities.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="center-sm">No opportunities yet.</Text>
					</div>
				) : (
					<>
						<Text variant="stat-label">
							{list.count} opportunit{list.count === 1 ? "y" : "ies"}
						</Text>
						<ul className="mt-4 list-none space-y-4">
							{opportunities.map((opportunity) => (
								<li key={opportunity.id}>
									<OpportunityCard opportunity={opportunity} showEdit />
								</li>
							))}
						</ul>
						<ListPagination currentPage={currentPage} totalCount={list.count} />
					</>
				)}
			</div>
		</SidebarLayout>
	);
}
