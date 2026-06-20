import type {
	MediaOutlet,
	MediaOutletCreatePayload,
	MediaOutletUpdatePayload,
} from "@customTypes/mediaOutlet";

export type MediaOutletFormValues = {
	name: string;
	website_url: string;
};

export const defaultMediaOutletFormValues = (): MediaOutletFormValues => ({
	name: "",
	website_url: "",
});

export const mediaOutletToFormValues = (
	outlet: MediaOutlet,
): MediaOutletFormValues => ({
	name: outlet.name,
	website_url: outlet.website_url,
});

export const formValuesToCreatePayload = (
	values: MediaOutletFormValues,
): MediaOutletCreatePayload => ({
	name: values.name.trim(),
	website_url: values.website_url.trim(),
});

export const formValuesToUpdatePayload = (
	values: MediaOutletFormValues,
): MediaOutletUpdatePayload => formValuesToCreatePayload(values);
