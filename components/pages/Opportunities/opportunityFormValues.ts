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

export type OpportunityFormValues = {
	title: string;
	short_description: string;
	full_description: RichTextContent;
	media_outlet: SelectOption | null;
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
): SelectOption[] =>
	outlets.map((outlet) => ({
		label: outlet.name,
		value: String(outlet.pk),
	}));

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
	short_description: "",
	full_description: emptyFullDescription(),
	media_outlet: null,
});

export const opportunityToFormValues = (
	opportunity: ApiOpportunity,
	outlets?: MediaOutlet[],
): OpportunityFormValues => ({
	title: opportunity.title,
	short_description: opportunity.short_description,
	full_description: fullDescriptionToRichText(opportunity.full_description),
	media_outlet: resolveMediaOutletSelectOption(
		opportunity.media_outlet,
		opportunity.media_outlet_name,
		outlets,
	),
});

export const formValuesToCreatePayload = (
	values: OpportunityFormValues,
): OpportunityCreatePayload => ({
	title: values.title.trim(),
	short_description: values.short_description.trim(),
	full_description: fullDescriptionToApiField(values.full_description),
	media_outlet: values.media_outlet ? Number(values.media_outlet.value) : null,
});

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
