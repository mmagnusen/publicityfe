import * as Yup from "yup";

import type { SelectOption } from "@components/Select/Select";
import type { RichTextContent } from "@customTypes/index";

import {
	type OpportunityFormValues,
	validateFullDescription,
} from "./opportunityFormValues";

export const SHORT_DESCRIPTION_MAX_LENGTH = 250;

const requiredSelectOption = (message: string) =>
	Yup.mixed()
		.nullable()
		.test("required", message, (value) => {
			const option = value as SelectOption | null | undefined;
			return Boolean(option?.value);
		});

const hasApplicationDeadlineSelected = (
	value: SelectOption | null | undefined,
): boolean => value?.value === "yes";

const isOtherOpportunityTypeSelected = (
	value: SelectOption | null | undefined,
): boolean => value?.value === "other";

const isOtherMediaOutletSelected = (
	value: SelectOption | null | undefined,
): boolean => value?.value === "other";

export const opportunityFormValidationSchema = Yup.object().shape({
	title: Yup.string().trim().required("Title is required"),
	type: requiredSelectOption("Type is required"),
	type_other: Yup.string().when("type", {
		is: isOtherOpportunityTypeSelected,
		then: (schema) => schema.trim().required("Please specify the type"),
		otherwise: (schema) => schema,
	}),
	short_description: Yup.string()
		.trim()
		.required("Short description is required")
		.max(
			SHORT_DESCRIPTION_MAX_LENGTH,
			`Short description must be ${SHORT_DESCRIPTION_MAX_LENGTH} characters or fewer`,
		),
	full_description: Yup.object().test(
		"has-content",
		"Full description is required",
		(value) => validateFullDescription(value as RichTextContent) === undefined,
	),
	media_outlet: Yup.mixed().nullable(),
	other_media_outlet: Yup.string().when("media_outlet", {
		is: isOtherMediaOutletSelected,
		then: (schema) => schema.trim().required("Please specify the media outlet"),
		otherwise: (schema) => schema,
	}),
	has_application_deadline: Yup.mixed().nullable(),
	application_deadline_date: Yup.string().when("has_application_deadline", {
		is: hasApplicationDeadlineSelected,
		then: (schema) => schema.trim().required("Select a date"),
		otherwise: (schema) => schema,
	}),
	application_deadline_hour: Yup.mixed()
		.nullable()
		.when("has_application_deadline", {
			is: hasApplicationDeadlineSelected,
			then: () => requiredSelectOption("Select an hour"),
			otherwise: (schema) => schema.nullable(),
		}),
}) as Yup.ObjectSchema<OpportunityFormValues>;
