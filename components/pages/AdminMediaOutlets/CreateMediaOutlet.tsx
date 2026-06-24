"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	createMediaOutlet,
	revalidateMediaOutletLists,
} from "@hooks/useMediaOutlets";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";
import { MediaOutletForm } from "./MediaOutletForm";
import {
	defaultMediaOutletFormValues,
	formValuesToCreatePayload,
	type MediaOutletFormValues,
} from "./mediaOutletFormValues";

export function CreateMediaOutlet() {
	const router = useRouter();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: MediaOutletFormValues) => {
		setIsSubmitting(true);
		try {
			await createMediaOutlet(formValuesToCreatePayload(values));
			await revalidateMediaOutletLists();
			await router.push("/admin/media-outlets");
		} finally {
			setIsSubmitting(false);
		}
	};

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
			<div className="mb-6">
				<Link
					href="/admin/media-outlets"
					className="text-sm font-medium text-gray-600 hover:text-black"
				>
					← Back to media outlets
				</Link>
			</div>

			<Heading level={1} variant="page-lg">
				New media outlet
			</Heading>
			<Text variant="page-subtitle">
				Add a media outlet to ${TRADING_NAME}.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<MediaOutletForm
					initialValues={defaultMediaOutletFormValues()}
					isSubmitting={isSubmitting}
					onSubmit={handleSubmit}
					submitLabel="Create media outlet"
				/>
			</div>
		</SidebarLayout>
	);
}
