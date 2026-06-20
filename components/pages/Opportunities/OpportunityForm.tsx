"use client";

import { useMemo } from "react";
import axios from "axios";
import { Form, Formik } from "formik";

import { useAllMediaOutlets } from "@hooks/useMediaOutlets";
import { getOpportunityApiErrorMessage } from "@hooks/useOpportunities";

import Button from "@/components/Button";
import Field from "@/components/FormikFields/Field";
import InputField from "@/components/FormikFields/InputField";
import SelectField from "@/components/FormikFields/SelectField";
import TextAreaField from "@/components/FormikFields/TextAreaField";
import TipTapEditorField from "@/components/FormikFields/TipTapEditorField";
import Text from "@/components/Text";
import {
	mediaOutletsToSelectOptions,
	type OpportunityFormValues,
	validateFullDescription,
} from "./opportunityFormValues";

const drfFieldMap: Partial<
	Record<keyof OpportunityFormValues | "media_outlet", string>
> = {
	title: "title",
	short_description: "short_description",
	full_description: "full_description",
	media_outlet: "media_outlet",
};

const validateOpportunityForm = (values: OpportunityFormValues) => {
	const errors: Partial<Record<keyof OpportunityFormValues, string>> = {};

	if (!values.title.trim()) {
		errors.title = "Title is required";
	}

	if (!values.short_description.trim()) {
		errors.short_description = "Short description is required";
	}

	const fullDescriptionError = validateFullDescription(values.full_description);
	if (fullDescriptionError) {
		errors.full_description = fullDescriptionError;
	}

	return errors;
};

type Props = {
	initialValues: OpportunityFormValues;
	onSubmit: (values: OpportunityFormValues) => Promise<void>;
	isSubmitting: boolean;
	submitLabel: string;
	onDelete?: () => void;
	isDeleting?: boolean;
};

export function OpportunityForm({
	initialValues,
	onSubmit,
	isSubmitting,
	submitLabel,
	onDelete,
	isDeleting,
}: Props) {
	const {
		data: mediaOutlets,
		error: mediaOutletsError,
		isLoading: isLoadingMediaOutlets,
	} = useAllMediaOutlets();
	const mediaOutletOptions = useMemo(
		() => mediaOutletsToSelectOptions(mediaOutlets ?? []),
		[mediaOutlets],
	);

	return (
		<Formik<OpportunityFormValues>
			enableReinitialize
			initialValues={initialValues}
			validate={validateOpportunityForm}
			onSubmit={async (values, { setFieldError, setStatus }) => {
				setStatus(undefined);
				try {
					await onSubmit(values);
				} catch (error: unknown) {
					const body = axios.isAxiosError(error)
						? error.response?.data
						: undefined;

					if (
						body != null &&
						typeof body === "object" &&
						!Array.isArray(body)
					) {
						for (const [key, val] of Object.entries(body)) {
							const fieldName = drfFieldMap[key as keyof typeof drfFieldMap];
							if (
								fieldName &&
								Array.isArray(val) &&
								val.length > 0 &&
								typeof val[0] === "string"
							) {
								setFieldError(fieldName, val[0]);
								return;
							}
						}
					}

					setStatus(getOpportunityApiErrorMessage(error));
				}
			}}
		>
			{({ status, values }) => (
				<Form noValidate className="space-y-2">
					<Field fieldLabel="Title" fieldName="title">
						<InputField
							name="title"
							placeHolder="Pitch your startup"
							strHelperMessage="Headline shown in opportunity listings"
						/>
					</Field>

					<Field fieldLabel="Short description" fieldName="short_description">
						<TextAreaField
							name="short_description"
							placeHolder="Brief summary"
							strHelperMessage="Shown on cards and search results"
						/>
					</Field>

					<Field fieldLabel="Media outlet" fieldName="media_outlet">
						<SelectField
							arrOptions={mediaOutletOptions}
							isDisabled={isLoadingMediaOutlets}
							isSearchable
							name="media_outlet"
							placeholder={
								isLoadingMediaOutlets
									? "Loading media outlets…"
									: "Select a media outlet"
							}
						/>
					</Field>

					{mediaOutletsError ? (
						<Text variant="error">
							Could not load media outlets. Try refreshing the page.
						</Text>
					) : null}

					<TipTapEditorField
						existingContent={values.full_description.editorJSON}
						key={`full-description-${initialValues.title}`}
						name="full_description"
						renderToolbar
						strLabel="Full description"
					/>

					{status ? <Text variant="error">{status}</Text> : null}

					<div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
						<Button
							bLoading={isSubmitting}
							isDisabled={isSubmitting || isDeleting}
							textTransform="none"
							type="submit"
						>
							{submitLabel}
						</Button>

						{onDelete ? (
							<Button
								isDisabled={isSubmitting || isDeleting}
								onClick={onDelete}
								strVariant="red"
								textTransform="none"
								type="button"
							>
								{isDeleting ? "Deleting…" : "Delete opportunity"}
							</Button>
						) : null}
					</div>
				</Form>
			)}
		</Formik>
	);
}
