"use client";

import axios from "axios";
import { Form, Formik } from "formik";

import TipTapEditorField from "@components/FormikFields/TipTapEditorField";
import {
	getContentApiErrorMessage,
	PROFILE_BIO_TEMPLATE_SLUG,
} from "@hooks/useContent";

import Button from "@/components/Button";
import Field from "@/components/FormikFields/Field";
import InputField from "@/components/FormikFields/InputField";
import Text from "@/components/Text";
import { type ContentFormValues } from "./contentFormValues";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const validateContentForm = (values: ContentFormValues) => {
	const errors: Partial<Record<"slug" | "body", string>> = {};
	const slug = values.slug.trim();

	if (!slug) {
		errors.slug = "Slug is required";
	} else if (!SLUG_PATTERN.test(slug)) {
		errors.slug = "Use lowercase letters, numbers, and hyphens only";
	}

	return errors;
};

type Props = {
	initialValues: ContentFormValues;
	onSubmit: (values: ContentFormValues) => Promise<void>;
	isSubmitting: boolean;
	submitLabel: string;
	onDelete?: () => void;
	isDeleting?: boolean;
	slugLocked?: boolean;
};

export function ContentForm({
	initialValues,
	onSubmit,
	isSubmitting,
	submitLabel,
	onDelete,
	isDeleting,
	slugLocked = false,
}: Props) {
	return (
		<Formik<ContentFormValues>
			enableReinitialize
			initialValues={initialValues}
			validate={validateContentForm}
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
							if (
								(key === "slug" || key === "content") &&
								Array.isArray(val) &&
								val.length > 0 &&
								typeof val[0] === "string"
							) {
								setFieldError(key === "content" ? "body" : "slug", val[0]);
								return;
							}
						}
					}

					setStatus(getContentApiErrorMessage(error));
				}
			}}
		>
			{({ status }) => (
				<Form noValidate className="space-y-4">
					<Field fieldLabel="Slug" fieldName="slug">
						<InputField
							bDisabled={slugLocked}
							name="slug"
							placeHolder={PROFILE_BIO_TEMPLATE_SLUG}
							strHelperMessage={
								slugLocked
									? "Slug cannot be changed after creation"
									: `Unique key used to fetch this template (e.g. ${PROFILE_BIO_TEMPLATE_SLUG})`
							}
						/>
					</Field>

					<Field fieldLabel="Content" fieldName="body">
						<TipTapEditorField
							existingContent={initialValues.body.editorJSON}
							name="body"
							renderToolbar
						/>
					</Field>

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
								{isDeleting ? "Deleting…" : "Delete content"}
							</Button>
						) : null}
					</div>
				</Form>
			)}
		</Formik>
	);
}
