"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	formatApplicationApprovalStatusLabel,
	type MyApplication,
	normalizeMyApplicationsResponse,
	parseApplicationApprovalStatus,
	useMyApplications,
} from "@hooks/useMyApplications";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Tag from "@/components/Tag";
import type { TagSkin } from "@/components/Tag/Tag";
import Text from "@/components/Text";

const APPROVAL_STATUS_TAG_SKINS: Record<"submitted" | "approved", TagSkin> = {
	submitted: "yellow",
	approved: "green",
};

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

function ApplicationCard({ application }: { application: MyApplication }) {
	const approvalStatus = parseApplicationApprovalStatus(
		application.approval_status,
	);

	return (
		<Link
			className="block rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50"
			href={`/opportunity/${application.opportunity_id}`}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-black">
						{application.opportunity_title}
					</p>
					{approvalStatus ? (
						<div className="mt-2">
							<Tag skin={APPROVAL_STATUS_TAG_SKINS[approvalStatus]}>
								{formatApplicationApprovalStatusLabel(approvalStatus)}
							</Tag>
						</div>
					) : null}
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

export function ApplicationsContent() {
	const router = useRouter();
	const { authenticationChecked, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useMyApplications(1);
	const list = useMemo(() => normalizeMyApplicationsResponse(data), [data]);

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
				<Text variant="loading">Loading your applications…</Text>
			</div>
		);
	}

	if (!isLoggedIn) {
		return null;
	}

	return (
		<SidebarLayout>
			<Heading level={1} variant="page-lg">
				Applications
			</Heading>
			<Text variant="page-subtitle">
				Track opportunities you have applied to.
			</Text>

			<div className="mt-8">
				{isLoading && !data ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="loading">Loading your applications…</Text>
					</div>
				) : error ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="error">
							{accessDenied
								? "Could not load your applications. You may not have permission."
								: "Could not load your applications. Try again later."}
						</Text>
					</div>
				) : list.results.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="center-sm">
							You haven&apos;t applied to any opportunities yet.
						</Text>
						<div className="mt-4 flex justify-center">
							<Button href="/opportunity" textTransform="none">
								Browse opportunities
							</Button>
						</div>
					</div>
				) : (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="stat-label">
							{list.count} application{list.count === 1 ? "" : "s"}
						</Text>
						<ul className="mt-4 list-none space-y-4">
							{list.results.map((application) => (
								<li key={application.pk}>
									<ApplicationCard application={application} />
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</SidebarLayout>
	);
}
