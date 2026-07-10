"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mdiChevronDown } from "@mdi/js";
import Icon from "@mdi/react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { usePublicUser } from "@hooks/usePublicUser";
import {
	countReceivedApplicationsByStatus,
	filterReceivedApplications,
	formatReceivedApplicationRelativeTime,
	formatReceivedApplicationStatusLabel,
	normalizeReceivedApplicationsResponse,
	parseReceivedApplicationDisplayStatus,
	RECEIVED_APPLICATION_FILTER_OPTIONS,
	type ReceivedApplication,
	type ReceivedApplicationFilterStatus,
	receivedApplicantAvatarPalette,
	receivedApplicantDisplayName,
	receivedApplicantInitials,
	receivedApplicationDetailPath,
	receivedApplicationMessageSnippet,
	receivedApplicationMetaLine,
	receivedApplicationOpportunitySubtitle,
	receivedApplicationStatusBadgeClassName,
	receivedApplicationTagNames,
	useReceivedApplications,
} from "@hooks/useReceivedApplications";

import Button from "@/components/Button";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { cn } from "@/lib/cn";
import { tipTapApiValueToPlainText } from "@/lib/tiptap-utils";

function ReceivedApplicationRow({
	application,
}: {
	application: ReceivedApplication;
}) {
	const applicantUsername = application.applicant_username?.trim() || null;
	const { data: applicant } = usePublicUser(applicantUsername);

	const name = receivedApplicantDisplayName(application);
	const initials = receivedApplicantInitials(application);
	const palette = receivedApplicantAvatarPalette(
		applicantUsername ?? String(application.pk),
	);
	const status = parseReceivedApplicationDisplayStatus(application);
	const headline =
		applicant?.human_profile?.tagline?.trim() ||
		applicant?.human_profile?.headline?.trim() ||
		null;
	const city = applicant?.human_profile?.city?.trim() || null;
	const metaLine = receivedApplicationMetaLine(application, headline, city);
	const shortDescription = tipTapApiValueToPlainText(
		applicant?.human_profile?.short_description,
	).trim();
	const bioSnippet = tipTapApiValueToPlainText(
		applicant?.human_profile?.bio,
	).trim();
	const profileSnippet = receivedApplicationMessageSnippet(
		shortDescription || bioSnippet,
	);
	const applicationPreview = receivedApplicationMessageSnippet(
		application.message,
	);
	const tagNames = receivedApplicationTagNames(
		application,
		(applicant?.tags ?? []).map((tag) => tag.name),
	);
	const applicationHref = receivedApplicationDetailPath(application.pk);

	const content = (
		<>
			<span
				className={cn(
					"inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
					palette.bg,
					palette.text,
				)}
				aria-hidden
			>
				{initials}
			</span>

			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-4">
					<div className="flex min-w-0 flex-wrap items-center gap-2">
						<p className="text-sm font-semibold text-gray-900">{name}</p>
						<span
							className={cn(
								"inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
								receivedApplicationStatusBadgeClassName(status),
							)}
						>
							{formatReceivedApplicationStatusLabel(status)}
						</span>
					</div>
					<span className="shrink-0 text-xs text-gray-400">
						{formatReceivedApplicationRelativeTime(application.created_at)}
					</span>
				</div>

				{metaLine ? (
					<p className="mt-1 text-sm text-gray-500">{metaLine}</p>
				) : null}

				<div className="mt-2 flex items-end justify-between gap-4">
					{profileSnippet || applicationPreview ? (
						<div className="min-w-0 flex-1 space-y-1">
							{profileSnippet ? (
								<p className="text-sm text-gray-500">{profileSnippet}</p>
							) : null}
							{applicationPreview ? (
								<p className="text-sm leading-relaxed text-gray-400">
									{applicationPreview}
								</p>
							) : null}
						</div>
					) : (
						<span className="flex-1" />
					)}
					{tagNames.length > 0 ? (
						<div className="flex shrink-0 flex-wrap justify-end gap-2">
							{tagNames.map((tag) => (
								<span key={tag} className="text-xs text-gray-400">
									{tag}
								</span>
							))}
						</div>
					) : null}
				</div>

				<div className="mt-3">
					<Link
						className="text-sm font-semibold text-violet-700 hover:text-violet-800"
						href={applicationHref}
					>
						View application →
					</Link>
				</div>
			</div>
		</>
	);

	return (
		<div className="px-6 py-5">
			<div className="flex gap-4">{content}</div>
		</div>
	);
}

export function ReceivedApplicationsContent() {
	const router = useRouter();
	const { authenticationChecked, isLoggedIn } = useAuthenticatedUser();
	const [page, setPage] = useState(1);
	const [activeFilter, setActiveFilter] =
		useState<ReceivedApplicationFilterStatus>("all");
	const [accumulatedApplications, setAccumulatedApplications] = useState<
		ReceivedApplication[]
	>([]);
	const { data, error, isLoading, isValidating } =
		useReceivedApplications(page);
	const list = useMemo(
		() => normalizeReceivedApplicationsResponse(data),
		[data],
	);

	useEffect(() => {
		if (!data) {
			return;
		}

		const normalized = normalizeReceivedApplicationsResponse(data);
		setAccumulatedApplications((current) => {
			if (page === 1) {
				return normalized.results;
			}

			const existingIds = new Set(current.map((item) => item.pk));
			const nextItems = normalized.results.filter(
				(item) => !existingIds.has(item.pk),
			);

			return [...current, ...nextItems];
		});
	}, [data, page]);

	const filteredApplications = useMemo(
		() => filterReceivedApplications(accumulatedApplications, activeFilter),
		[accumulatedApplications, activeFilter],
	);

	const filterCounts = useMemo(() => {
		const counts = countReceivedApplicationsByStatus(accumulatedApplications);
		return {
			...counts,
			all: list.count || accumulatedApplications.length,
		};
	}, [accumulatedApplications, list.count]);

	const opportunitySubtitle = useMemo(
		() => receivedApplicationOpportunitySubtitle(accumulatedApplications),
		[accumulatedApplications],
	);

	const hasMore = Boolean(list.next);
	const isLoadingMore = isValidating && page > 1;

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
				<Text variant="loading">Loading applications received…</Text>
			</div>
		);
	}

	if (!isLoggedIn) {
		return null;
	}

	return (
		<SidebarLayout>
			<div className="mt-2">
				{isLoading && page === 1 && !data ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="loading">Loading applications received…</Text>
					</div>
				) : error ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="error">
							{accessDenied
								? "Could not load applications received. You may not have permission."
								: "Could not load applications received. Try again later."}
						</Text>
					</div>
				) : accumulatedApplications.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<div className="flex items-start justify-between gap-4">
							<h1 className="text-lg font-semibold text-black">
								Applications received
							</h1>
						</div>
						<Text variant="center-sm" className="mt-8">
							No pitches have been submitted to your opportunities yet.
						</Text>
						<div className="mt-4 flex justify-center">
							<Button href="/create-opportunity" textTransform="none">
								Post an opportunity
							</Button>
						</div>
					</div>
				) : (
					<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
						<div className="border-b border-gray-200 px-6 py-5">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<h1 className="text-lg font-semibold text-black">
										Applications received
									</h1>
									{opportunitySubtitle ? (
										<p className="mt-1 text-sm text-gray-500">
											{opportunitySubtitle}
										</p>
									) : (
										<p className="mt-1 text-sm text-gray-500">
											Pitches submitted to your opportunities
										</p>
									)}
								</div>
								<p className="shrink-0 text-sm font-medium text-gray-900">
									{list.count || accumulatedApplications.length} application
									{(list.count || accumulatedApplications.length) === 1
										? ""
										: "s"}
								</p>
							</div>

							<div className="mt-4 flex flex-wrap gap-2">
								{RECEIVED_APPLICATION_FILTER_OPTIONS.map((option) => {
									const isActive = activeFilter === option.id;
									const count = filterCounts[option.id];

									return (
										<button
											key={option.id}
											type="button"
											className={cn(
												"rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
												isActive
													? "border-gray-900 bg-white text-gray-900"
													: "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
											)}
											onClick={() => setActiveFilter(option.id)}
										>
											{option.label} ({count})
										</button>
									);
								})}
							</div>
						</div>

						{filteredApplications.length === 0 ? (
							<div className="px-6 py-10 text-center">
								<Text variant="center-sm">
									No applications match this filter.
								</Text>
							</div>
						) : (
							<ul className="list-none divide-y divide-gray-200">
								{filteredApplications.map((application) => (
									<li key={application.pk}>
										<ReceivedApplicationRow application={application} />
									</li>
								))}
							</ul>
						)}

						{hasMore ? (
							<div className="flex justify-center border-t border-gray-200 px-6 py-5">
								<button
									type="button"
									className="inline-flex size-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
									disabled={isLoadingMore}
									onClick={() => setPage((current) => current + 1)}
									aria-label="Load more applications"
								>
									<Icon
										horizontal
										path={mdiChevronDown}
										rotate={180}
										size={0.9}
										vertical
									/>
								</button>
							</div>
						) : null}
					</div>
				)}
			</div>
		</SidebarLayout>
	);
}
