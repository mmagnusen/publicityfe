"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { Navigation } from "@/components/Navigation";
import Text from "@/components/Text";

export function DashboardContent() {
	const router = useRouter();
	const { authenticationChecked, authenticatedUser, isLoggedIn } =
		useAuthenticatedUser();

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	if (!authenticationChecked) {
		return (
			<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
				<Text variant="loading">Loading your dashboard…</Text>
			</div>
		);
	}

	if (!isLoggedIn || !authenticatedUser) {
		return null;
	}

	return (
		<div className="min-h-full bg-gray-50 font-sans">
			<Navigation isLoggedIn />

			<main className="mx-auto max-w-6xl px-6 py-10">
				<Heading level={1} variant="page-lg">
					Welcome back, {authenticatedUser.firstName}
				</Heading>
				<Text variant="page-subtitle">
					Your dashboard for managing media opportunities and your profile.
				</Text>

				<div className="mt-8 grid gap-4 sm:grid-cols-3">
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="stat-label">New matches</Text>
						<Text variant="stat-value">12</Text>
					</div>
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="stat-label">Applications</Text>
						<Text variant="stat-value">3</Text>
					</div>
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="stat-label">Profile views</Text>
						<Text variant="stat-value">48</Text>
					</div>
				</div>

				<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
					<Heading level={2} variant="subsection">
						Quick links
					</Heading>
					<div className="mt-4 flex flex-wrap gap-3">
						<Button href="/opportunity/1" textTransform="none">
							View sample opportunity
						</Button>
						<Button
							href="/profile/1"
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							View your profile
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
