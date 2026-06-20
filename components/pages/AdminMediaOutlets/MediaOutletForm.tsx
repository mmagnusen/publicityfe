"use client";

import axios from "axios";
import { Form, Formik } from "formik";

import { getMediaOutletApiErrorMessage } from "@hooks/useMediaOutlets";

import Button from "@/components/Button";
import Field from "@/components/FormikFields/Field";
import InputField from "@/components/FormikFields/InputField";
import Text from "@/components/Text";
import { type MediaOutletFormValues } from "./mediaOutletFormValues";

const drfFieldMap: Partial<
	Record<keyof MediaOutletFormValues, keyof MediaOutletFormValues>
> = {
	name: "name",
	website_url: "website_url",
};

const validateMediaOutletForm = (values: MediaOutletFormValues) => {
	const errors: Partial<Record<keyof MediaOutletFormValues, string>> = {};

	if (!values.name.trim()) {
		errors.name = "Name is required";
	}

	const websiteUrl = values.website_url.trim();
	if (!websiteUrl) {
		errors.website_url = "Website URL is required";
	} else {
		try {
			new URL(websiteUrl);
		} catch {
			errors.website_url = "Enter a valid URL";
		}
	}

	return errors;
};

type Props = {
	initialValues: MediaOutletFormValues;
	onSubmit: (values: MediaOutletFormValues) => Promise<void>;
	isSubmitting: boolean;
	submitLabel: string;
	onDelete?: () => void;
	isDeleting?: boolean;
};

export function MediaOutletForm({
	initialValues,
	onSubmit,
	isSubmitting,
	submitLabel,
	onDelete,
	isDeleting,
}: Props) {
	return (
		<Formik<MediaOutletFormValues>
			enableReinitialize
			initialValues={initialValues}
			validate={validateMediaOutletForm}
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
							const fieldName = drfFieldMap[key as keyof MediaOutletFormValues];
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

					setStatus(getMediaOutletApiErrorMessage(error));
				}
			}}
		>
			{({ status }) => (
				<Form noValidate className="space-y-2">
					<Field fieldLabel="Name" fieldName="name">
						<InputField
							name="name"
							placeHolder="BBC News"
							strHelperMessage="Display name for the media outlet"
						/>
					</Field>

					<Field fieldLabel="Website URL" fieldName="website_url">
						<InputField
							name="website_url"
							placeHolder="https://www.bbc.co.uk/news"
							strHelperMessage="Full URL including https://"
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
								{isDeleting ? "Deleting…" : "Delete media outlet"}
							</Button>
						) : null}
					</div>
				</Form>
			)}
		</Formik>
	);
}
