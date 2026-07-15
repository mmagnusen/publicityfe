import { getInitialEditorValues } from "@components/FormikFields/TipTapEditorField";
import type { ContentBlock, ContentCreatePayload } from "@customTypes/content";
import type { RichTextContent } from "@customTypes/index";
import { RichTextDefaultValues } from "@customTypes/index";

import { bioToApiField } from "@/lib/profileForm";

export type ContentFormValues = {
	slug: string;
	body: RichTextContent;
};

export const defaultContentFormValues = (): ContentFormValues => ({
	slug: "",
	body: { ...RichTextDefaultValues },
});

export const contentToFormValues = (
	block: ContentBlock,
): ContentFormValues => ({
	slug: block.slug,
	body: getInitialEditorValues(block.content),
});

export const formValuesToCreatePayload = (
	values: ContentFormValues,
): ContentCreatePayload => ({
	slug: values.slug.trim(),
	content: bioToApiField(values.body),
});

export const formValuesToUpdatePayload = (
	values: ContentFormValues,
): ContentCreatePayload => formValuesToCreatePayload(values);
