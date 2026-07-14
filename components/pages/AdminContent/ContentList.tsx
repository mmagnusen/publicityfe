"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	CONTENT_PER_PAGE,
	normalizeContentListResponse,
	PROFILE_BIO_TEMPLATE_SLUG,
	useAdminContentList,
} from "@hooks/useContent";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";

function ListPagination({
	currentPage,
	totalCount,
}: {
	currentPage: number;
	totalCount: number;
}) {
	const totalPages = Math.max(1, Math.ceil(totalCount / CONTENT_PER_PAGE));

	if (totalPages <= 1) {
		return null;
	}

	const prevHref =
		currentPage > 1 ? `/admin/content?page=${currentPage - 1}` : undefined;
	const nextHref =
		currentPage < totalPages
			? `/admin/content?page=${currentPage + 1}`
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

export function ContentList() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();

	const pageFromQuery = Number(searchParams.get("page")) || 1;
	const currentPage = pageFromQuery >= 1 ? pageFromQuery : 1;

	const { data, error, isLoading } = useAdminContentList(currentPage);
	const list = useMemo(() => normalizeContentListResponse(data), [data]);

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
						Content templates
					</Heading>
					<Text variant="page-subtitle">
						Editable TipTap blocks used as defaults (e.g.{" "}
						<code className="text-xs">{PROFILE_BIO_TEMPLATE_SLUG}</code>).
					</Text>
				</div>
				<Button href="/admin/content/create" textTransform="none">
					New content
				</Button>
			</div>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				{!authenticationChecked || (isLoading && !data) ? (
					<Text variant="loading">Loading content…</Text>
				) : error ? (
					<Text variant="error">
						{accessDenied
							? "Access denied. Sign in with a staff account to continue."
							: "Could not load content. Check the API is available and try again."}
					</Text>
				) : (
					<>
						<Text variant="stat-label">
							{list.count} block{list.count === 1 ? "" : "s"}
						</Text>

						{list.results.length === 0 ? (
							<Text variant="center-sm">No content templates yet.</Text>
						) : (
							<ul className="mt-4 divide-y divide-gray-200">
								{list.results.map((block) => (
									<li
										key={block.pk}
										className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="min-w-0">
											<p className="font-semibold text-black">{block.slug}</p>
											<p className="mt-1 text-xs text-gray-400">
												ID {block.pk}
											</p>
										</div>
										<Button
											href={`/admin/content/${block.pk}`}
											size="small"
											strVariant="transparentWithBorder"
											textTransform="none"
										>
											Edit
										</Button>
									</li>
								))}
							</ul>
						)}

						<ListPagination currentPage={currentPage} totalCount={list.count} />
					</>
				)}
			</div>
		</SidebarLayout>
	);
}
