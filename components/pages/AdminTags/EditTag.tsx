"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { mutate } from "swr";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	deleteTag,
	patchTag,
	revalidateTagLists,
	tagAdminDetailPath,
	useAdminTag,
} from "@hooks/useTags";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { TagForm } from "./TagForm";
import {
	formValuesToUpdatePayload,
	type TagFormValues,
	tagToFormValues,
} from "./tagFormValues";

export function EditTag() {
	const router = useRouter();
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);

	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useAdminTag(
		Number.isFinite(pk) && pk > 0 ? pk : null,
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const initialValues = useMemo(
		() => (data ? tagToFormValues(data) : null),
		[data],
	);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: TagFormValues) => {
		if (!Number.isFinite(pk) || pk <= 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await patchTag(pk, formValuesToUpdatePayload(values));
			await mutate(tagAdminDetailPath(pk));
			await revalidateTagLists();
			await router.push("/admin/tags");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!Number.isFinite(pk) || pk <= 0) {
			return;
		}

		if (!window.confirm("Delete this tag? This cannot be undone.")) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteTag(pk);
			await revalidateTagLists();
			await router.push("/admin/tags");
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
				<Text variant="center-sm">Invalid tag.</Text>
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
				Edit tag
			</Heading>
			<Text variant="page-subtitle">Update the tag name.</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				{isLoading ? (
					<Text variant="loading">Loading tag…</Text>
				) : error || !data || !initialValues ? (
					<Text variant="error">
						Could not load this tag. It may not exist or you may not have
						permission to edit it.
					</Text>
				) : (
					<TagForm
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
