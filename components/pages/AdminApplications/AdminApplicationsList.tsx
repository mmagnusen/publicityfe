"use client";

import { useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import {
	type AdminApplication,
	APPLICATIONS_PER_PAGE,
	useAdminApplications,
} from "@/hooks/useAdminApplications";

function formatDate(dateString: string) {
	try {
		return new Date(dateString).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
}

function ApplicationCard({ application }: { application: AdminApplication }) {
	return (
		<Link
			className="block rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50"
			href={`/admin/applications/${application.pk}`}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-black">
						{application.opportunity_title}
					</p>
					<p className="mt-1 text-sm text-gray-500">
						From{" "}
						<span className="font-medium text-gray-700">
							{application.applicant_first_name}{" "}
							{application.applicant_last_name}
						</span>
						{application.applicant_username ? (
							<span className="text-gray-400">
								{" "}
								(@{application.applicant_username})
							</span>
						) : null}
					</p>
				</div>
				<span className="shrink-0 text-xs text-gray-400">
					{formatDate(application.created_at)}
				</span>
			</div>
			{application.message ? (
				<div
					className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600 [&_p]:mb-1"
					dangerouslySetInnerHTML={{ __html: application.message }}
				/>
			) : null}
		</Link>
	);
}

function ListPagination({
	currentPage,
	totalCount,
}: {
	currentPage: number;
	totalCount: number;
}) {
	const totalPages = Math.max(1, Math.ceil(totalCount / APPLICATIONS_PER_PAGE));

	if (totalPages <= 1) {
		return null;
	}

	const prevHref =
		currentPage > 1 ? `/admin/applications?page=${currentPage - 1}` : undefined;
	const nextHref =
		currentPage < totalPages
			? `/admin/applications?page=${currentPage + 1}`
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

export function AdminApplicationsList() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();

	const pageFromQuery = Number(searchParams.get("page")) || 1;
	const currentPage = pageFromQuery >= 1 ? pageFromQuery : 1;

	const { data, error, isLoading } = useAdminApplications(currentPage);

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
			<Heading level={1} variant="page-lg">
				All applications
			</Heading>
			<Text variant="page-subtitle">
				View every application submitted across all opportunities.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				{!authenticationChecked || (isLoading && !data) ? (
					<Text variant="loading">Loading applications…</Text>
				) : error ? (
					<Text variant="error">
						{accessDenied
							? "Access denied. Sign in with a staff account to continue."
							: "Could not load applications. Check the API is available and try again."}
					</Text>
				) : !data || data.results.length === 0 ? (
					<Text variant="center-sm">No applications yet.</Text>
				) : (
					<>
						<Text variant="stat-label">
							{data.count} application{data.count === 1 ? "" : "s"}
						</Text>
						<ul className="mt-4 list-none space-y-4">
							{data.results.map((application) => (
								<li key={application.pk}>
									<ApplicationCard application={application} />
								</li>
							))}
						</ul>
						<ListPagination currentPage={currentPage} totalCount={data.count} />
					</>
				)}
			</div>
		</SidebarLayout>
	);
}
