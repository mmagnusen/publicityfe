"use client";

import { useMemo } from "react";
import axios from "axios";
import { Form, Formik } from "formik";

import INPUT_TYPE from "@constants/inputTypes";
import { useAllMediaOutlets } from "@hooks/useMediaOutlets";
import { getOpportunityApiErrorMessage } from "@hooks/useOpportunities";

import Button from "@/components/Button";
import { fieldMessageVariants } from "@/components/FormField/style";
import Field from "@/components/FormikFields/Field";
import InputField from "@/components/FormikFields/InputField";
import SelectField from "@/components/FormikFields/SelectField";
import TextAreaField from "@/components/FormikFields/TextAreaField";
import TipTapEditorField from "@/components/FormikFields/TipTapEditorField";
import Text from "@/components/Text";
import {
	opportunityFormValidationSchema,
	SHORT_DESCRIPTION_MAX_LENGTH,
} from "./opportunityFormValidation";
import {
	applicationDeadlineHourOptions,
	applicationDeadlineYesNoOptions,
	hasApplicationDeadlineSelected,
	isOtherMediaOutletSelected,
	isOtherOpportunityTypeSelected,
	mediaOutletsToSelectOptions,
	normalizeOpportunityFormValuesForSubmit,
	type OpportunityFormValues,
	opportunityTypeOptions,
} from "./opportunityFormValues";

const drfFieldMap: Partial<Record<string, keyof OpportunityFormValues>> = {
	title: "title",
	type: "type",
	type_other: "type_other",
	short_description: "short_description",
	full_description: "full_description",
	media_outlet: "media_outlet",
	other_media_outlet: "other_media_outlet",
	application_deadline: "application_deadline_date",
};

function DeadlineFieldFooter({
	error,
	helper,
	isTouched,
}: {
	error?: string;
	helper?: string;
	isTouched?: boolean;
}) {
	if (isTouched && error) {
		return (
			<span className={fieldMessageVariants({ kind: "error" })}>{error}</span>
		);
	}

	if (helper) {
		return (
			<span className={fieldMessageVariants({ kind: "helper" })}>{helper}</span>
		);
	}

	return <span className="block min-h-5" aria-hidden />;
}

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
	const deadlineHourOptions = useMemo(
		() => applicationDeadlineHourOptions(),
		[],
	);
	const typeOptions = useMemo(() => opportunityTypeOptions(), []);

	return (
		<Formik<OpportunityFormValues>
			enableReinitialize
			initialValues={initialValues}
			validationSchema={opportunityFormValidationSchema}
			onSubmit={async (values, { setFieldError, setStatus }) => {
				setStatus(undefined);
				try {
					await onSubmit(normalizeOpportunityFormValuesForSubmit(values));
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
			{({ errors, status, touched, setFieldValue, values }) => {
				const showApplicationDeadlineFields = hasApplicationDeadlineSelected(
					values.has_application_deadline,
				);
				const showOtherTypeField = isOtherOpportunityTypeSelected(values.type);
				const showOtherMediaOutletField = isOtherMediaOutletSelected(
					values.media_outlet,
				);

				return (
					<Form noValidate className="space-y-2">
						<Field fieldLabel="Title" fieldName="title">
							<InputField
								name="title"
								placeHolder="Pitch your startup"
								strHelperMessage="Title shown in the opportunity listing"
							/>
						</Field>

						<Field fieldLabel="Type" fieldName="type">
							<SelectField
								arrOptions={typeOptions}
								isSearchable={false}
								name="type"
								onChangeCallback={(option) => {
									if (
										option != null &&
										!Array.isArray(option) &&
										"value" in option &&
										option.value !== "other"
									) {
										setFieldValue("type_other", "");
									}
								}}
								placeholder="Select a type"
								helperText="Eg is this for an article, podcast, panel etc?"
							/>
						</Field>

						{showOtherTypeField ? (
							<Field fieldLabel="Other opportunity type" fieldName="type_other">
								<InputField
									name="type_other"
									placeHolder="e.g. Newsletter, TV appearance"
									strHelperMessage="Please describe the type of opportunity"
								/>
							</Field>
						) : null}

						<Field fieldLabel="Short summary" fieldName="short_description">
							<TextAreaField
								maxLength={SHORT_DESCRIPTION_MAX_LENGTH}
								name="short_description"
								placeHolder="Brief summary"
								strHelperMessage="A short summary of the opportunity, 250 characters max"
							/>
						</Field>

						<Field
							fieldLabel="Does this opportunity have an application deadline?"
							fieldName="has_application_deadline"
						>
							<SelectField
								arrOptions={applicationDeadlineYesNoOptions}
								isSearchable={false}
								name="has_application_deadline"
								onChangeCallback={(option) => {
									if (
										option != null &&
										!Array.isArray(option) &&
										"value" in option &&
										option.value === "no"
									) {
										setFieldValue("application_deadline_date", "");
										setFieldValue("application_deadline_hour", null);
									}
								}}
								placeholder="Select"
							/>
						</Field>

						{showApplicationDeadlineFields ? (
							<div className="mb-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:grid-rows-[auto_auto_minmax(1.25rem,auto)]">
								<label
									className="flex items-center justify-start sm:col-start-1 sm:row-start-1"
									htmlFor="application_deadline_date"
								>
									Application deadline date
								</label>
								<div className="sm:col-start-1 sm:row-start-2">
									<InputField
										bCompact
										bHideInlineMessages
										id="application_deadline_date"
										name="application_deadline_date"
										onChangeCallback={(event) => {
											if (!event.target.value) {
												setFieldValue("application_deadline_hour", null);
											}
										}}
										type={INPUT_TYPE.DATE}
									/>
								</div>
								<div className="sm:col-start-1 sm:row-start-3">
									<DeadlineFieldFooter
										error={errors.application_deadline_date}
										helper="Last date to apply"
										isTouched={touched.application_deadline_date}
									/>
								</div>

								<label
									className="flex items-center justify-start sm:col-start-2 sm:row-start-1"
									htmlFor="application_deadline_hour"
								>
									Application deadline hour
								</label>
								<div className="sm:col-start-2 sm:row-start-2">
									<SelectField
										arrOptions={deadlineHourOptions}
										bCompact
										bHideInlineMessages
										id="application_deadline_hour"
										isClearable
										isSearchable
										name="application_deadline_hour"
										onChangeCallback={(option) => {
											if (option == null || Array.isArray(option)) {
												setFieldValue("application_deadline_date", "");
											}
										}}
										placeholder="Select hour"
									/>
								</div>
								<div className="sm:col-start-2 sm:row-start-3">
									<DeadlineFieldFooter
										error={errors.application_deadline_hour}
										isTouched={touched.application_deadline_hour}
									/>
								</div>
							</div>
						) : null}

						<Field fieldLabel="Media outlet" fieldName="media_outlet">
							<SelectField
								arrOptions={mediaOutletOptions}
								isDisabled={isLoadingMediaOutlets}
								isSearchable
								name="media_outlet"
								onChangeCallback={(option) => {
									if (
										option != null &&
										!Array.isArray(option) &&
										"value" in option &&
										option.value !== "other"
									) {
										setFieldValue("other_media_outlet", "");
									}
								}}
								placeholder={
									isLoadingMediaOutlets
										? "Loading media outlets…"
										: "Select a media outlet"
								}
							/>
						</Field>

						{showOtherMediaOutletField ? (
							<Field
								fieldLabel="Other media outlet"
								fieldName="other_media_outlet"
							>
								<InputField
									name="other_media_outlet"
									placeHolder="e.g. Local newsletter, industry blog"
								/>
							</Field>
						) : null}

						{mediaOutletsError ? (
							<Text variant="error">
								Could not load media outlets. Try refreshing the page.
							</Text>
						) : null}

						<TipTapEditorField
							contentMinHeight="12rem"
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
				);
			}}
		</Formik>
	);
}
