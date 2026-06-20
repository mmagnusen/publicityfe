import type { Tag, TagCreatePayload, TagUpdatePayload } from "@customTypes/tag";

export type TagFormValues = {
	name: string;
};

export const defaultTagFormValues = (): TagFormValues => ({
	name: "",
});

export const tagToFormValues = (tag: Tag): TagFormValues => ({
	name: tag.name,
});

export const formValuesToCreatePayload = (
	values: TagFormValues,
): TagCreatePayload => ({
	name: values.name.trim(),
});

export const formValuesToUpdatePayload = (
	values: TagFormValues,
): TagUpdatePayload => formValuesToCreatePayload(values);
