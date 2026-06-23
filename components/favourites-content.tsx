"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	normalizeFavoriteOpportunitiesResponse,
	useMyFavouriteOpportunities,
} from "@hooks/useOpportunities";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { OpportunityCard } from "@/components/opportunities-list";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { mapApiOpportunitiesToDisplay } from "@/lib/opportunities";

export function FavouritesContent() {
	const router = useRouter();
	const { authenticationChecked, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useMyFavouriteOpportunities(1);
	const list = useMemo(
		() => normalizeFavoriteOpportunitiesResponse(data),
		[data],
	);
	const favourites = useMemo(
		() =>
			mapApiOpportunitiesToDisplay(list.results).map((opportunity) => ({
				...opportunity,
				isFavorited: true,
			})),
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

	if (!authenticationChecked) {
		return (
			<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
				<Text variant="loading">Loading favourites…</Text>
			</div>
		);
	}

	if (!isLoggedIn) {
		return null;
	}

	return (
		<SidebarLayout>
			<Heading level={1} variant="page-lg">
				Favourites
			</Heading>
			<Text variant="page-subtitle">
				Opportunities you have saved for later.
			</Text>

			<div className="mt-8">
				{isLoading && !data ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="loading">Loading your favourites…</Text>
					</div>
				) : error ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="error">
							{accessDenied
								? "Could not load your favourites. You may not have permission."
								: "Could not load your favourites. Try again later."}
						</Text>
					</div>
				) : favourites.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="center-sm">
							You haven&apos;t favourited any opportunities yet.
						</Text>
						<div className="mt-4 flex justify-center">
							<Button href="/opportunity" textTransform="none">
								Browse opportunities
							</Button>
						</div>
					</div>
				) : (
					<>
						<Text variant="stat-label">
							{list.count} favourit{list.count === 1 ? "e" : "es"}
						</Text>
						<ul className="mt-4 list-none space-y-4">
							{favourites.map((opportunity) => (
								<li key={opportunity.id}>
									<OpportunityCard opportunity={opportunity} />
								</li>
							))}
						</ul>
					</>
				)}
			</div>
		</SidebarLayout>
	);
}
