"use client";

import { useMemo } from "react";
import axios from "axios";
import { Form, Formik } from "formik";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { useAllTags } from "@hooks/useTags";

import Button from "@/components/Button";
import Field from "@/components/FormikFields/Field";
import InputField from "@/components/FormikFields/InputField";
import SelectField from "@/components/FormikFields/SelectField";
import TipTapEditorField from "@/components/FormikFields/TipTapEditorField";
import Text from "@/components/Text";
import {
	bioToApiField,
	type ProfileFormValues,
	selectOptionsToTagPks,
	tagsToSelectOptions,
} from "@/lib/profileForm";

const humanProfileFieldMap: Partial<Record<string, keyof ProfileFormValues>> = {
	bio: "bio",
	short_description: "short_description",
	headline: "headline",
	tagline: "headline",
	city: "city",
	personal_website_url: "personal_website_url",
	linked_in_url: "linked_in_url",
	instagram_url: "instagram_url",
	facebook_url: "facebook_url",
};

const validateProfileForm = (values: ProfileFormValues) => {
	const errors: Partial<Record<keyof ProfileFormValues, string>> = {};

	if (!values.first_name.trim()) {
		errors.first_name = "First name is required";
	}

	if (!values.last_name.trim()) {
		errors.last_name = "Last name is required";
	}

	return errors;
};

type ProfileEditFormProps = {
	initialValues: ProfileFormValues;
	profileUsername: string;
	onSuccess: (values: ProfileFormValues) => void;
	onCancel: () => void;
};

export function ProfileEditForm({
	initialValues,
	profileUsername,
	onSuccess,
	onCancel,
}: ProfileEditFormProps) {
	const { funcUpdateProfile, funcUpdateUser, funcUpdateUserTags } =
		useAuthenticatedUser();
	const {
		data: tags,
		error: tagsError,
		isLoading: isLoadingTags,
	} = useAllTags();
	const tagOptions = useMemo(() => tagsToSelectOptions(tags ?? []), [tags]);

	return (
		<Formik<ProfileFormValues>
			enableReinitialize
			initialValues={initialValues}
			validate={validateProfileForm}
			onSubmit={async (values, { setFieldError, setStatus, setSubmitting }) => {
				setStatus(undefined);
				try {
					await funcUpdateUser({
						first_name: values.first_name.trim(),
						last_name: values.last_name.trim(),
					});
					await funcUpdateProfile({
						bio: bioToApiField(values.bio),
						short_description: bioToApiField(values.short_description),
						headline: values.headline.trim(),
						city: values.city.trim(),
						personal_website_url: values.personal_website_url.trim(),
						linked_in_url: values.linked_in_url.trim(),
						instagram_url: values.instagram_url.trim(),
						facebook_url: values.facebook_url.trim(),
					});
					try {
						await funcUpdateUserTags(selectOptionsToTagPks(values.tags));
					} catch {
						// Tags use an admin-only endpoint; don't block profile saves.
					}
					onSuccess(values);
				} catch (error: unknown) {
					setSubmitting(false);
					const body = axios.isAxiosError(error)
						? error.response?.data
						: undefined;

					if (
						body != null &&
						typeof body === "object" &&
						!Array.isArray(body)
					) {
						for (const [key, val] of Object.entries(body)) {
							const fieldName =
								key === "first_name" || key === "last_name"
									? (key as keyof ProfileFormValues)
									: key === "tag_pks"
										? ("tags" as keyof ProfileFormValues)
										: humanProfileFieldMap[key];
							if (
								fieldName &&
								(typeof val === "string" || Array.isArray(val))
							) {
								setFieldError(
									fieldName,
									Array.isArray(val) ? val.join(" ") : val,
								);
							}
						}
						return;
					}

					setStatus("Something went wrong. Please try again.");
				}
			}}
		>
			{({ isSubmitting, status }) => (
				<Form className="space-y-6">
					<div className="grid gap-6 sm:grid-cols-2">
						<Field fieldName="first_name" fieldLabel="First name">
							<InputField name="first_name" placeHolder="First name" />
						</Field>
						<Field fieldName="last_name" fieldLabel="Last name">
							<InputField name="last_name" placeHolder="Last name" />
						</Field>
					</div>

					<Field fieldName="headline" fieldLabel="Headline">
						<InputField
							name="headline"
							placeHolder="e.g. Founder & CEO, Bloom Drinks"
						/>
					</Field>

					<Field fieldName="city" fieldLabel="City">
						<InputField name="city" placeHolder="e.g. London, UK" />
					</Field>

					<Field fieldLabel="Tags" fieldName="tags">
						<SelectField
							arrOptions={tagOptions}
							isDisabled={isLoadingTags}
							isMulti
							isSearchable
							name="tags"
							placeholder={isLoadingTags ? "Loading tags…" : "Select tags"}
						/>
					</Field>

					{tagsError ? (
						<Text variant="error">
							Could not load tags. Try refreshing the page.
						</Text>
					) : null}

					<TipTapEditorField
						existingContent={initialValues.short_description.editorJSON}
						key={`profile-short-description-${profileUsername}-${JSON.stringify(initialValues.short_description.editorJSON)}`}
						name="short_description"
						renderToolbar
						strLabel="Short description"
					/>

					<TipTapEditorField
						existingContent={initialValues.bio.editorJSON}
						key={`profile-bio-${profileUsername}-${JSON.stringify(initialValues.bio.editorJSON)}`}
						name="bio"
						renderToolbar
						strLabel="Bio"
					/>

					<div className="space-y-6">
						<Text variant="label">Links</Text>
						<Field fieldName="personal_website_url" fieldLabel="Website">
							<InputField
								name="personal_website_url"
								placeHolder="https://example.com"
							/>
						</Field>
						<Field fieldName="linked_in_url" fieldLabel="LinkedIn">
							<InputField
								name="linked_in_url"
								placeHolder="https://linkedin.com/in/you"
							/>
						</Field>
						<Field fieldName="instagram_url" fieldLabel="Instagram">
							<InputField
								name="instagram_url"
								placeHolder="https://instagram.com/you"
							/>
						</Field>
						<Field fieldName="facebook_url" fieldLabel="Facebook">
							<InputField
								name="facebook_url"
								placeHolder="https://facebook.com/you"
							/>
						</Field>
					</div>

					{status ? <p className="text-sm text-red-600">{status}</p> : null}

					<div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
						<Button
							type="button"
							strVariant="transparentWithBorder"
							textTransform="none"
							onClick={onCancel}
							isDisabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							textTransform="none"
							bLoading={isSubmitting}
							isDisabled={isSubmitting}
						>
							Save changes
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
}
