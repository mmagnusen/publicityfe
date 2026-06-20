"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { mutate } from "swr";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import {
	deleteMediaOutlet,
	mediaOutletDetailPath,
	patchMediaOutlet,
	revalidateMediaOutletLists,
	useMediaOutlet,
} from "@hooks/useMediaOutlets";

import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { MediaOutletForm } from "./MediaOutletForm";
import {
	formValuesToUpdatePayload,
	type MediaOutletFormValues,
	mediaOutletToFormValues,
} from "./mediaOutletFormValues";

export function EditMediaOutlet() {
	const router = useRouter();
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);

	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useMediaOutlet(
		Number.isFinite(pk) && pk > 0 ? pk : null,
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const initialValues = useMemo(
		() => (data ? mediaOutletToFormValues(data) : null),
		[data],
	);

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (values: MediaOutletFormValues) => {
		if (!Number.isFinite(pk) || pk <= 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await patchMediaOutlet(pk, formValuesToUpdatePayload(values));
			await mutate(mediaOutletDetailPath(pk));
			await revalidateMediaOutletLists();
			await router.push("/admin/media-outlets");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!Number.isFinite(pk) || pk <= 0) {
			return;
		}

		if (!window.confirm("Delete this media outlet? This cannot be undone.")) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteMediaOutlet(pk);
			await revalidateMediaOutletLists();
			await router.push("/admin/media-outlets");
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
				<Text variant="center-sm">Invalid media outlet.</Text>
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
				Edit media outlet
			</Heading>
			<Text variant="page-subtitle">
				Update name and website for this outlet.
			</Text>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				{isLoading ? (
					<Text variant="loading">Loading media outlet…</Text>
				) : error || !data || !initialValues ? (
					<Text variant="error">
						Could not load this media outlet. It may not exist or you may not
						have permission to edit it.
					</Text>
				) : (
					<MediaOutletForm
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
