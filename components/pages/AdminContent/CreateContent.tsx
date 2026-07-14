"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { createContent, revalidateContentLists } from "@hooks/useContent";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";
import { ContentForm } from "./ContentForm";
import {
	type ContentFormValues,
	defaultContentFormValues,
	formValuesToCreatePayload,
} from "./contentFormValues";

export function CreateContent() {
	const router = useRouter();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: ContentFormValues) => {
		setIsSubmitting(true);
		try {
			await createContent(formValuesToCreatePayload(values));
			await revalidateContentLists();
			await router.push("/admin/content");
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
					href="/admin/content"
					className="text-sm font-medium text-gray-600 hover:text-black"
				>
					← Back to content
				</Link>
			</div>

			<Heading level={1} variant="page-lg">
				New content template
			</Heading>
			<Text variant="page-subtitle">
				Create an editable content block for {TRADING_NAME}.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<ContentForm
					initialValues={defaultContentFormValues()}
					isSubmitting={isSubmitting}
					onSubmit={handleSubmit}
					submitLabel="Create content"
				/>
			</div>
		</SidebarLayout>
	);
}
