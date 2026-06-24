"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeWaitlistEntriesResponse,
	useAdminWaitlistEntries,
	WAITLIST_ENTRIES_PER_PAGE,
} from "@hooks/useWaitlist";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";

function formatDate(value: string | undefined) {
	if (!value) {
		return "—";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "—";
	}

	return date.toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function ListPagination({
	currentPage,
	totalCount,
}: {
	currentPage: number;
	totalCount: number;
}) {
	const totalPages = Math.max(
		1,
		Math.ceil(totalCount / WAITLIST_ENTRIES_PER_PAGE),
	);

	if (totalPages <= 1) {
		return null;
	}

	const prevHref =
		currentPage > 1 ? `/admin/waitlist?page=${currentPage - 1}` : undefined;
	const nextHref =
		currentPage < totalPages
			? `/admin/waitlist?page=${currentPage + 1}`
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

export function WaitlistEntriesList() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();

	const pageFromQuery = Number(searchParams.get("page")) || 1;
	const currentPage = pageFromQuery >= 1 ? pageFromQuery : 1;

	const { data, error, isLoading } = useAdminWaitlistEntries(currentPage);
	const list = useMemo(() => normalizeWaitlistEntriesResponse(data), [data]);

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
			<div>
				<Heading level={1} variant="page-lg">
					Waitlist
				</Heading>
				<Text variant="page-subtitle">
					Everyone who has signed up for early access.
				</Text>
			</div>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				{!authenticationChecked || (isLoading && !data) ? (
					<Text variant="loading">Loading waitlist entries…</Text>
				) : error ? (
					<Text variant="error">
						{accessDenied
							? "Access denied. Sign in with a staff account to continue."
							: "Could not load waitlist entries. Check the API is available and try again."}
					</Text>
				) : (
					<>
						<Text variant="stat-label">
							{list.count} entr{list.count === 1 ? "y" : "ies"}
						</Text>

						{list.results.length === 0 ? (
							<Text variant="center-sm">No waitlist entries yet.</Text>
						) : (
							<div className="mt-4 overflow-x-auto">
								<div className="min-w-lg">
									<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_7rem] gap-4 border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
										<span>First name</span>
										<span>Email</span>
										<span>Joined</span>
									</div>
									<ul className="divide-y divide-gray-200">
										{list.results.map((entry) => (
											<li
												key={entry.pk}
												className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_7rem] gap-4 py-4 text-sm"
											>
												<span className="truncate font-medium text-black">
													{entry.first_name}
												</span>
												<span className="truncate text-gray-700">
													{entry.email}
												</span>
												<span className="text-gray-500">
													{formatDate(entry.created_at)}
												</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						)}

						<ListPagination currentPage={currentPage} totalCount={list.count} />
					</>
				)}
			</div>
		</SidebarLayout>
	);
}
