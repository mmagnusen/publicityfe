"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";

export function ApplicationsContent() {
	const router = useRouter();
	const { authenticationChecked, isLoggedIn } = useAuthenticatedUser();

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

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<Text variant="center-sm">
					You haven&apos;t applied to any opportunities yet.
				</Text>
				<div className="mt-4 flex justify-center">
					<Button href="/opportunity" textTransform="none">
						Browse opportunities
					</Button>
				</div>
			</div>
		</SidebarLayout>
	);
}
