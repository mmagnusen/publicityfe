"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { mutate } from "swr";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	contentAdminDetailPath,
	deleteContent,
	patchContent,
	revalidateContentLists,
	useAdminContent,
} from "@hooks/useContent";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { ContentForm } from "./ContentForm";
import {
	type ContentFormValues,
	contentToFormValues,
	formValuesToUpdatePayload,
} from "./contentFormValues";

export function EditContent() {
	const router = useRouter();
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);

	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useAdminContent(
		Number.isFinite(pk) && pk > 0 ? pk : null,
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const initialValues = useMemo(
		() => (data ? contentToFormValues(data) : null),
		[data],
	);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: ContentFormValues) => {
		if (!Number.isFinite(pk) || pk <= 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await patchContent(pk, formValuesToUpdatePayload(values));
			await mutate(contentAdminDetailPath(pk));
			await revalidateContentLists();
			await router.push("/admin/content");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!Number.isFinite(pk) || pk <= 0) {
			return;
		}

		if (
			!window.confirm("Delete this content template? This cannot be undone.")
		) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteContent(pk);
			await revalidateContentLists();
			await router.push("/admin/content");
		} finally {
			setIsDeleting(false);
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

	if (!Number.isFinite(pk) || pk <= 0) {
		return (
			<SidebarLayout>
				<Text variant="center-sm">Invalid content.</Text>
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
				Edit content template
			</Heading>
			<Text variant="page-subtitle">
				Update the slug and TipTap body for this content block.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				{isLoading ? (
					<Text variant="loading">Loading content…</Text>
				) : error || !data || !initialValues ? (
					<Text variant="error">
						Could not load this content. It may not exist or you may not have
						permission to edit it.
					</Text>
				) : (
					<ContentForm
						key={pk}
						initialValues={initialValues}
						isDeleting={isDeleting}
						isSubmitting={isSubmitting}
						onDelete={handleDelete}
						onSubmit={handleSubmit}
						submitLabel="Save changes"
					/>
				)}
			</div>
		</SidebarLayout>
	);
}
