"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeOpportunityListResponse,
	useMyOpportunities,
} from "@hooks/useOpportunities";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { OpportunityCardWithCreator } from "@/components/opportunities-list";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";

export function MyOpportunitiesContent() {
	const router = useRouter();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useMyOpportunities(1);
	const list = useMemo(() => normalizeOpportunityListResponse(data), [data]);

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
				<Text variant="loading">Loading your opportunities…</Text>
			</div>
		);
	}

	if (!isLoggedIn) {
		return null;
	}

	return (
		<SidebarLayout>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<Heading level={1} variant="page-lg">
						My opportunities
					</Heading>
					<Text variant="page-subtitle">Opportunities you have created.</Text>
				</div>
				{isAdmin ? (
					<Button href="/opportunity/create" textTransform="none">
						New opportunity
					</Button>
				) : null}
			</div>

			<div className="mt-8">
				{isLoading && !data ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="loading">Loading your opportunities…</Text>
					</div>
				) : error ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="error">
							{accessDenied
								? "Could not load your opportunities. You may not have permission."
								: "Could not load your opportunities. Try again later."}
						</Text>
					</div>
				) : list.results.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="center-sm">
							You haven&apos;t created any opportunities yet.
						</Text>
						{isAdmin ? (
							<div className="mt-4 flex justify-center">
								<Button href="/opportunity/create" textTransform="none">
									Add opportunity
								</Button>
							</div>
						) : null}
					</div>
				) : (
					<>
						<Text variant="stat-label">
							{list.count} opportunit{list.count === 1 ? "y" : "ies"}
						</Text>
						<ul className="mt-4 list-none space-y-4">
							{list.results.map((api) => (
								<li key={api.pk}>
									<OpportunityCardWithCreator api={api} showEdit={isAdmin} />
								</li>
							))}
						</ul>
					</>
				)}
			</div>
		</SidebarLayout>
	);
}
