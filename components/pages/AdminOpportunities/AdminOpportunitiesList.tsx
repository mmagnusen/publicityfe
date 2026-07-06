"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	ADMIN_OPPORTUNITY_STATUS_FILTER_OPTIONS,
	type AdminOpportunityStatus,
	buildAdminOpportunitiesPageHref,
	normalizeOpportunityListResponse,
	OPPORTUNITIES_PER_PAGE,
	parseAdminOpportunityStatusFromSearchParams,
	useAdminOpportunities,
} from "@hooks/useOpportunities";
import type { MultiValue, SingleValue } from "react-select";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { OpportunityCardWithCreator } from "@/components/opportunities-list";
import Select, { type SelectOption } from "@/components/Select/Select";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

function ListPagination({
	currentPage,
	status,
	totalCount,
}: {
	currentPage: number;
	status: AdminOpportunityStatus | "";
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
			? buildAdminOpportunitiesPageHref(currentPage - 1, status)
			: undefined;
	const nextHref =
		currentPage < totalPages
			? buildAdminOpportunitiesPageHref(currentPage + 1, status)
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
	const statusQuery = parseAdminOpportunityStatusFromSearchParams(searchParams);

	const selectedStatus =
		ADMIN_OPPORTUNITY_STATUS_FILTER_OPTIONS.find(
			(option) => option.value === statusQuery,
		) ?? ADMIN_OPPORTUNITY_STATUS_FILTER_OPTIONS[0];

	const { data, error, isLoading } = useAdminOpportunities(
		currentPage,
		OPPORTUNITIES_PER_PAGE,
		statusQuery,
	);
	const list = useMemo(() => normalizeOpportunityListResponse(data), [data]);

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

	const handleStatusChange = (
		value: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => {
		const option = Array.isArray(value) ? value[0] : value;
		router.push(
			buildAdminOpportunitiesPageHref(
				1,
				parseAdminOpportunityStatusFromSearchParams(
					new URLSearchParams(option?.value ? { status: option.value } : {}),
				),
			),
		);
	};

	return (
		<SidebarLayout>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<Heading level={1} variant="page-lg">
						All opportunities
					</Heading>
					<Text variant="page-subtitle">
						Manage every opportunity in {TRADING_NAME}.
					</Text>
				</div>
				<Button href="/opportunity/create" textTransform="none">
					New opportunity
				</Button>
			</div>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<div className="max-w-xs">
					<label
						className="mb-2 block text-sm font-medium text-gray-900"
						htmlFor="admin-opportunity-status"
					>
						Status
					</label>
					<Select
						arrOptions={[...ADMIN_OPPORTUNITY_STATUS_FILTER_OPTIONS]}
						bCompact
						id="admin-opportunity-status"
						isSearchable={false}
						onChange={handleStatusChange}
						value={selectedStatus}
					/>
				</div>

				<div className="mt-6">
					{!authenticationChecked || (isLoading && !data) ? (
						<Text variant="loading">Loading opportunities…</Text>
					) : error ? (
						<Text variant="error">
							{accessDenied
								? "Access denied. Sign in with a staff account to continue."
								: "Could not load opportunities. Check the API is available and try again."}
						</Text>
					) : list.results.length === 0 ? (
						<Text variant="center-sm">
							{statusQuery
								? "No opportunities found for this status."
								: "No opportunities yet."}
						</Text>
					) : (
						<>
							<Text variant="stat-label">
								{list.count} opportunit{list.count === 1 ? "y" : "ies"}
							</Text>
							<ul className="mt-4 list-none space-y-4">
								{list.results.map((api) => (
									<li key={api.pk}>
										<OpportunityCardWithCreator
											api={api}
											detailHref={`/admin/opportunity/${api.pk}`}
											editHref={`/admin/opportunity/${api.pk}/edit`}
											showEdit
										/>
									</li>
								))}
							</ul>
							<ListPagination
								currentPage={currentPage}
								status={statusQuery}
								totalCount={list.count}
							/>
						</>
					)}
				</div>
			</div>
		</SidebarLayout>
	);
}
