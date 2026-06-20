"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { createTag, revalidateTagLists } from "@hooks/useTags";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { TagForm } from "./TagForm";
import {
	defaultTagFormValues,
	formValuesToCreatePayload,
	type TagFormValues,
} from "./tagFormValues";

export function CreateTag() {
	const router = useRouter();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: TagFormValues) => {
		setIsSubmitting(true);
		try {
			await createTag(formValuesToCreatePayload(values));
			await revalidateTagLists();
			await router.push("/admin/tags");
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
					href="/admin/tags"
					className="text-sm font-medium text-gray-600 hover:text-black"
				>
					← Back to tags
				</Link>
			</div>

			<Heading level={1} variant="page-lg">
				New tag
			</Heading>
			<Text variant="page-subtitle">Add a tag to Spotlight.</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<TagForm
					initialValues={defaultTagFormValues()}
					isSubmitting={isSubmitting}
					onSubmit={handleSubmit}
					submitLabel="Create tag"
				/>
			</div>
		</SidebarLayout>
	);
}
