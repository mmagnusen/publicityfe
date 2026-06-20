"use client";

import axios from "axios";
import { Form, Formik } from "formik";

import { getTagApiErrorMessage } from "@hooks/useTags";

import Button from "@/components/Button";
import Field from "@/components/FormikFields/Field";
import InputField from "@/components/FormikFields/InputField";
import Text from "@/components/Text";
import { type TagFormValues } from "./tagFormValues";

const validateTagForm = (values: TagFormValues) => {
	const errors: Partial<Record<keyof TagFormValues, string>> = {};

	if (!values.name.trim()) {
		errors.name = "Name is required";
	}

	return errors;
};

type Props = {
	initialValues: TagFormValues;
	onSubmit: (values: TagFormValues) => Promise<void>;
	isSubmitting: boolean;
	submitLabel: string;
	onDelete?: () => void;
	isDeleting?: boolean;
};

export function TagForm({
	initialValues,
	onSubmit,
	isSubmitting,
	submitLabel,
	onDelete,
	isDeleting,
}: Props) {
	return (
		<Formik<TagFormValues>
			enableReinitialize
			initialValues={initialValues}
			validate={validateTagForm}
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
								key === "name" &&
								Array.isArray(val) &&
								val.length > 0 &&
								typeof val[0] === "string"
							) {
								setFieldError("name", val[0]);
								return;
							}
						}
					}

					setStatus(getTagApiErrorMessage(error));
				}
			}}
		>
			{({ status }) => (
				<Form noValidate className="space-y-2">
					<Field fieldLabel="Name" fieldName="name">
						<InputField
							name="name"
							placeHolder="e.g. Startup"
							strHelperMessage="Short label used to categorise profiles and opportunities"
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
								{isDeleting ? "Deleting…" : "Delete tag"}
							</Button>
						) : null}
					</div>
				</Form>
			)}
		</Formik>
	);
}
