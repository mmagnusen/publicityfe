import type { SelectOption } from "@components/Select/Select";

export const OPPORTUNITY_TYPES = [
	{ value: "podcast", label: "Podcast" },
	{ value: "article", label: "Article" },
	{ value: "radio", label: "Radio" },
	{ value: "panel", label: "Panel" },
	{ value: "conference", label: "Conference" },
	{ value: "event", label: "Event" },
	{ value: "news", label: "News" },
	{ value: "other", label: "Other" },
] as const;

export type OpportunityTypeValue = (typeof OPPORTUNITY_TYPES)[number]["value"];

export const DEFAULT_OPPORTUNITY_TYPE: OpportunityTypeValue = "other";

export const opportunityTypeSelectOptions = (): SelectOption[] =>
	OPPORTUNITY_TYPES.map(({ value, label }) => ({ value, label }));

export const opportunityTypeLabel = (
	value: string | null | undefined,
): string => {
	const trimmed = value?.trim();
	const match = OPPORTUNITY_TYPES.find((type) => type.value === trimmed);
	return match?.label ?? "Other";
};

export const resolveOpportunityTypeOption = (
	value: string | null | undefined,
): SelectOption => {
	const trimmed = value?.trim();
	const match = OPPORTUNITY_TYPES.find((type) => type.value === trimmed);
	if (match) {
		return { value: match.value, label: match.label };
	}

	const fallback = OPPORTUNITY_TYPES.find(
		(type) => type.value === DEFAULT_OPPORTUNITY_TYPE,
	);
	return {
		value: fallback?.value ?? DEFAULT_OPPORTUNITY_TYPE,
		label: fallback?.label ?? "Other",
	};
};
