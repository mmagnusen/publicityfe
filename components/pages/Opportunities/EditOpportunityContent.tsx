"use client";

import { useMemo, useState } from "react";

import { useAllMediaOutlets } from "@hooks/useMediaOutlets";
import {
	deleteOpportunity,
	patchOpportunity,
	revalidateOpportunityDetailCaches,
	revalidateOpportunityLists,
	useAdminOpportunity,
} from "@hooks/useOpportunities";

import Text from "@/components/Text";
import { OpportunityForm } from "./OpportunityForm";
import {
	formValuesToUpdatePayload,
	type OpportunityFormValues,
	opportunityToFormValues,
} from "./opportunityFormValues";

type EditOpportunityContentProps = {
	onDeleteSuccess?: () => void | Promise<void>;
	onSubmitSuccess?: () => void | Promise<void>;
	opportunityPk: number;
	showDelete?: boolean;
};

export function EditOpportunityContent({
	onDeleteSuccess,
	onSubmitSuccess,
	opportunityPk,
	showDelete = true,
}: EditOpportunityContentProps) {
	const { data, error, isLoading } = useAdminOpportunity(
		Number.isFinite(opportunityPk) && opportunityPk > 0 ? opportunityPk : null,
	);
	const { data: mediaOutlets } = useAllMediaOutlets();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const initialValues = useMemo(
		() => (data ? opportunityToFormValues(data, mediaOutlets) : null),
		[data, mediaOutlets],
	);

	const handleSubmit = async (values: OpportunityFormValues) => {
		if (!Number.isFinite(opportunityPk) || opportunityPk <= 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await patchOpportunity(opportunityPk, formValuesToUpdatePayload(values));
			await revalidateOpportunityDetailCaches(opportunityPk);
			await revalidateOpportunityLists();
			await onSubmitSuccess?.();
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!Number.isFinite(opportunityPk) || opportunityPk <= 0) {
			return;
		}

		if (!window.confirm("Delete this opportunity? This cannot be undone.")) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteOpportunity(opportunityPk);
			await revalidateOpportunityLists();
			await onDeleteSuccess?.();
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading) {
		return <Text variant="loading">Loading opportunity…</Text>;
	}

	if (error || !data || !initialValues) {
		return (
			<Text variant="error">
				Could not load this opportunity. It may not exist or you may not have
				permission to edit it.
			</Text>
		);
	}

	return (
		<OpportunityForm
			key={`${opportunityPk}-${data.application_deadline ?? "none"}`}
			initialValues={initialValues}
			isDeleting={isDeleting}
			isSubmitting={isSubmitting}
			onDelete={showDelete ? handleDelete : undefined}
			onSubmit={handleSubmit}
			submitLabel="Save changes"
		/>
	);
}
