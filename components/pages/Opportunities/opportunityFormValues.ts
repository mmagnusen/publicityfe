import { getInitialEditorValues } from "@components/FormikFields/TipTapEditorField";
import type { SelectOption } from "@components/Select/Select";
import type { RichTextContent } from "@customTypes/index";
import { RichTextDefaultValues } from "@customTypes/index";
import type { MediaOutlet } from "@customTypes/mediaOutlet";
import type {
	ApiOpportunity,
	OpportunityCreatePayload,
	OpportunityUpdatePayload,
} from "@customTypes/opportunity";
import {
	emptyTipTapDoc,
	parseTipTapDocFromApi,
	unwrapMisstoredJsonStringTipTapDoc,
} from "@lib/tiptap-utils";

import {
	DEFAULT_OPPORTUNITY_TYPE,
	opportunityTypeSelectOptions,
	resolveOpportunityTypeOption,
} from "@/constants/opportunityTypes";

export type OpportunityFormValues = {
	title: string;
	type: SelectOption | null;
	type_other: string;
	short_description: string;
	full_description: RichTextContent;
	media_outlet: SelectOption | null;
	other_media_outlet: string;
	has_application_deadline: SelectOption | null;
	application_deadline_date: string;
	application_deadline_hour: SelectOption | null;
};

export const opportunityTypeOptions = (): SelectOption[] =>
	opportunityTypeSelectOptions();

export const defaultOpportunityTypeOption = (): SelectOption =>
	resolveOpportunityTypeOption(DEFAULT_OPPORTUNITY_TYPE);

export const applicationDeadlineYesNoOptions: SelectOption[] = [
	{ label: "Yes, this opportunity has an application deadline", value: "yes" },
	{
		label: "No, this opportunity does not have an application deadline",
		value: "no",
	},
];

export const yesApplicationDeadlineOption = (): SelectOption =>
	applicationDeadlineYesNoOptions.find((option) => option.value === "yes") ??
	applicationDeadlineYesNoOptions[0];

export const noApplicationDeadlineOption = (): SelectOption =>
	applicationDeadlineYesNoOptions.find((option) => option.value === "no") ??
	applicationDeadlineYesNoOptions[1];

export const applicationDeadlineHourOptions = (): SelectOption[] =>
	Array.from({ length: 24 }, (_, hour) => ({
		label: `${String(hour).padStart(2, "0")}:00`,
		value: String(hour),
	}));

const defaultHasApplicationDeadline = (): SelectOption =>
	noApplicationDeadlineOption();

export const hasApplicationDeadlineSelected = (
	value: SelectOption | null,
): boolean => value?.value === "yes";

export const isOtherOpportunityTypeSelected = (
	value: SelectOption | null,
): boolean => value?.value === "other";

export const OTHER_MEDIA_OUTLET_OPTION_VALUE = "other";

export const otherMediaOutletSelectOption = (): SelectOption => ({
	label: "Other",
	value: OTHER_MEDIA_OUTLET_OPTION_VALUE,
});

export const isOtherMediaOutletSelected = (
	value: SelectOption | null,
): boolean => value?.value === OTHER_MEDIA_OUTLET_OPTION_VALUE;

export const resolveHasApplicationDeadlineOption = (
	applicationDeadline: string | null | undefined,
): SelectOption =>
	applicationDeadline?.trim()
		? yesApplicationDeadlineOption()
		: noApplicationDeadlineOption();

export const normalizeOpportunityFormValuesForSubmit = (
	values: OpportunityFormValues,
): OpportunityFormValues => {
	const normalizedValues: OpportunityFormValues = {
		...values,
	};

	if (!hasApplicationDeadlineSelected(values.has_application_deadline)) {
		normalizedValues.has_application_deadline = noApplicationDeadlineOption();
		normalizedValues.application_deadline_date = "";
		normalizedValues.application_deadline_hour = null;
	}

	if (!isOtherOpportunityTypeSelected(values.type)) {
		normalizedValues.type_other = "";
	}

	if (!isOtherMediaOutletSelected(values.media_outlet)) {
		normalizedValues.other_media_outlet = "";
	}

	return normalizedValues;
};

export const applicationDeadlineToApiValue = (
	values: OpportunityFormValues,
): string | null => {
	if (!hasApplicationDeadlineSelected(values.has_application_deadline)) {
		return null;
	}

	return formDeadlineToApiDateTime(
		values.application_deadline_date,
		values.application_deadline_hour,
	);
};

const apiDeadlineToFormValues = (
	raw: string | null | undefined,
): Pick<
	OpportunityFormValues,
	"application_deadline_date" | "application_deadline_hour"
> => {
	const trimmed = raw?.trim();
	if (!trimmed) {
		return {
			application_deadline_date: "",
			application_deadline_hour: null,
		};
	}

	const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})/);
	if (match) {
		const hour = Number(match[2]);
		if (Number.isInteger(hour) && hour >= 0 && hour <= 23) {
			return {
				application_deadline_date: match[1],
				application_deadline_hour: {
					label: `${match[2]}:00`,
					value: String(hour),
				},
			};
		}
	}

	const date = new Date(trimmed);
	if (Number.isNaN(date.getTime())) {
		return {
			application_deadline_date: "",
			application_deadline_hour: null,
		};
	}

	const pad = (value: number) => String(value).padStart(2, "0");
	const hour = date.getHours();

	return {
		application_deadline_date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
		application_deadline_hour: {
			label: `${pad(hour)}:00`,
			value: String(hour),
		},
	};
};

const formDeadlineToApiDateTime = (
	date: string,
	hour: SelectOption | null,
): string | null => {
	const trimmedDate = date.trim();
	if (!trimmedDate || !hour) {
		return null;
	}

	const hourNum = Number(hour.value);
	if (!Number.isInteger(hourNum) || hourNum < 0 || hourNum > 23) {
		return null;
	}

	return `${trimmedDate}T${String(hourNum).padStart(2, "0")}:00:00`;
};

const tipTapDocHasContent = (json: unknown): boolean => {
	const doc = parseTipTapDocFromApi(json);
	return (
		doc != null &&
		Array.isArray(doc.content) &&
		doc.content.some((block) => {
			if (!block || typeof block !== "object") {
				return false;
			}
			if (block.type === "paragraph" && Array.isArray(block.content)) {
				return block.content.length > 0;
			}
			return true;
		})
	);
};

export const mediaOutletsToSelectOptions = (
	outlets: MediaOutlet[],
): SelectOption[] => [
	...outlets.map((outlet) => ({
		label: outlet.name,
		value: String(outlet.pk),
	})),
	otherMediaOutletSelectOption(),
];

export const resolveMediaOutletSelectOption = (
	mediaOutlet: ApiOpportunity["media_outlet"],
	mediaOutletName?: ApiOpportunity["media_outlet_name"],
	outlets?: MediaOutlet[],
): SelectOption | null => {
	if (mediaOutlet == null) {
		return null;
	}

	const outlet = outlets?.find((item) => item.pk === mediaOutlet);
	if (outlet) {
		return {
			label: outlet.name,
			value: String(outlet.pk),
		};
	}

	if (mediaOutletName?.trim()) {
		return {
			label: mediaOutletName.trim(),
			value: String(mediaOutlet),
		};
	}

	return {
		label: `Media outlet ${mediaOutlet}`,
		value: String(mediaOutlet),
	};
};

export const resolveOpportunityMediaOutletFormValues = (
	opportunity: ApiOpportunity,
	outlets?: MediaOutlet[],
): Pick<OpportunityFormValues, "media_outlet" | "other_media_outlet"> => {
	if (opportunity.other_media_outlet?.trim()) {
		return {
			media_outlet: otherMediaOutletSelectOption(),
			other_media_outlet: opportunity.other_media_outlet.trim(),
		};
	}

	return {
		media_outlet: resolveMediaOutletSelectOption(
			opportunity.media_outlet,
			opportunity.media_outlet_name,
			outlets,
		),
		other_media_outlet: "",
	};
};

export const emptyFullDescription = (): RichTextContent => ({
	...RichTextDefaultValues,
	editorJSON: emptyTipTapDoc(),
});

export const fullDescriptionToRichText = (
	raw: string | undefined,
): RichTextContent => {
	const parsedDoc = parseTipTapDocFromApi(raw);
	if (parsedDoc) {
		return {
			...RichTextDefaultValues,
			editorJSON: unwrapMisstoredJsonStringTipTapDoc(parsedDoc),
		};
	}

	if (raw?.trim()) {
		return getInitialEditorValues(raw);
	}

	return emptyFullDescription();
};

const fullDescriptionToApiField = (rich: RichTextContent): string => {
	const doc = parseTipTapDocFromApi(rich.editorJSON);
	if (doc && tipTapDocHasContent(doc)) {
		return JSON.stringify(unwrapMisstoredJsonStringTipTapDoc(doc));
	}

	const html = rich.editorHTML?.trim();
	if (html) {
		return html;
	}

	return "";
};

export const defaultOpportunityFormValues = (): OpportunityFormValues => ({
	title: "",
	type: defaultOpportunityTypeOption(),
	type_other: "",
	short_description: "",
	full_description: emptyFullDescription(),
	media_outlet: null,
	other_media_outlet: "",
	has_application_deadline: defaultHasApplicationDeadline(),
	application_deadline_date: "",
	application_deadline_hour: null,
});

export const opportunityToFormValues = (
	opportunity: ApiOpportunity,
	outlets?: MediaOutlet[],
): OpportunityFormValues => {
	const deadlineValues = apiDeadlineToFormValues(
		opportunity.application_deadline,
	);

	return {
		title: opportunity.title,
		type: resolveOpportunityTypeOption(opportunity.type),
		type_other: opportunity.type_other?.trim() ?? "",
		short_description: opportunity.short_description,
		full_description: fullDescriptionToRichText(opportunity.full_description),
		...resolveOpportunityMediaOutletFormValues(opportunity, outlets),
		has_application_deadline: resolveHasApplicationDeadlineOption(
			opportunity.application_deadline,
		),
		...deadlineValues,
	};
};

export const formValuesToCreatePayload = (
	values: OpportunityFormValues,
): OpportunityCreatePayload => {
	const normalizedValues = normalizeOpportunityFormValuesForSubmit(values);
	const typeOther = isOtherOpportunityTypeSelected(normalizedValues.type)
		? normalizedValues.type_other.trim()
		: "";
	const otherMediaOutlet = isOtherMediaOutletSelected(
		normalizedValues.media_outlet,
	)
		? normalizedValues.other_media_outlet.trim()
		: "";

	return {
		title: normalizedValues.title.trim(),
		type: normalizedValues.type?.value ?? DEFAULT_OPPORTUNITY_TYPE,
		...(typeOther ? { type_other: typeOther } : {}),
		short_description: normalizedValues.short_description.trim(),
		full_description: fullDescriptionToApiField(
			normalizedValues.full_description,
		),
		media_outlet: isOtherMediaOutletSelected(normalizedValues.media_outlet)
			? null
			: normalizedValues.media_outlet
				? Number(normalizedValues.media_outlet.value)
				: null,
		...(otherMediaOutlet ? { other_media_outlet: otherMediaOutlet } : {}),
		application_deadline: applicationDeadlineToApiValue(normalizedValues),
	};
};

export const formValuesToUpdatePayload = (
	values: OpportunityFormValues,
): OpportunityUpdatePayload => formValuesToCreatePayload(values);

export const validateFullDescription = (
	fullDescription: RichTextContent,
): string | undefined => {
	if (
		fullDescription.characterCount > 0 ||
		tipTapDocHasContent(fullDescription.editorJSON)
	) {
		return undefined;
	}

	return "Full description is required";
};
