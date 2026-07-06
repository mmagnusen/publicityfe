import type { SelectOption } from "@components/Select/Select";
import type {
	MediaOutlet,
	MediaOutletCreatePayload,
	MediaOutletUpdatePayload,
} from "@customTypes/mediaOutlet";

import { selectOptionsToTagPks, tagsToSelectOptions } from "@/lib/profileForm";

export type MediaOutletFormValues = {
	name: string;
	website_url: string;
	founded_year: string;
	image_url: string;
	tags: SelectOption[];
};

export const defaultMediaOutletFormValues = (): MediaOutletFormValues => ({
	name: "",
	website_url: "",
	founded_year: "",
	image_url: "",
	tags: [],
});

export const mediaOutletToFormValues = (
	outlet: MediaOutlet,
): MediaOutletFormValues => ({
	name: outlet.name,
	website_url: outlet.website_url,
	founded_year:
		outlet.founded_year != null && outlet.founded_year > 0
			? String(outlet.founded_year)
			: "",
	image_url: outlet.image_url?.trim() ?? "",
	tags: tagsToSelectOptions(outlet.tags),
});

const parseFoundedYear = (value: string): number | null => {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const year = Number(trimmed);
	return Number.isInteger(year) && year > 0 ? year : null;
};

export const formValuesToCreatePayload = (
	values: MediaOutletFormValues,
): MediaOutletCreatePayload => ({
	name: values.name.trim(),
	website_url: values.website_url.trim(),
	founded_year: parseFoundedYear(values.founded_year),
	tag_pks: selectOptionsToTagPks(values.tags),
});

export const formValuesToUpdatePayload = (
	values: MediaOutletFormValues,
): MediaOutletUpdatePayload => ({
	...formValuesToCreatePayload(values),
	image_url: values.image_url.trim() || null,
});
