"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { profilePagePath } from "@/lib/publicUser";

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
		<SidebarLayout>
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
					<Button href="/opportunity" textTransform="none">
						Browse opportunities
					</Button>
					{authenticatedUser.username?.trim() ? (
						<Button
							href={profilePagePath(authenticatedUser.username)}
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							View your profile
						</Button>
					) : null}
				</div>
			</div>
		</SidebarLayout>
	);
}
