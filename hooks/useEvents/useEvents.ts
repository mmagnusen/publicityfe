import type { User } from "@constants/user";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import { instanceAxios } from "@util/instanceAxios";

export type DelphiEventFormValues = {
	content: {
		characterCount: number;
		editorHTML: string;
		editorJSON: string;
		wordCount: number;
	};
	slug: string;
	title: string;
	shortDescription: string;
};

export type VenueType = {
	address_first_line: string;
	address_second_line?: string;
	city: string;
	country: string;
	description: string;
	google_maps_place_id: string;
	instagram_url: string;
	name: string;
	postcode: string;
};

export type DelphiEvent = {
	content?: string;
	cost_in_pence?: number;
	date: string;
	hosts: User[];
	is_cancelled?: boolean;
	pk?: number;
	short_description: string;
	slug: string;
	title: string;
	venue?: VenueType;
};

export const useEvents = () => {
	const { reportError } = useErrorReport({ functionNamePrefix: "useEvents" });

	const funcCreateEvent = async ({
		title,
		content,
		slug,
		short_description,
	}: Omit<DelphiEvent, "date" | "hosts">) => {
		try {
			await instanceAxios({
				method: "post",
				url: `/event/create`,
				data: { title, content, slug, short_description },
			});
		} catch (error: any) {
			reportError(error, "funcCreateEvent", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funEditEvent = async ({
		formValues,
		pk,
	}: {
		formValues: Omit<DelphiEvent, "date" | "hosts">;
		pk: number;
	}) => {
		try {
			await instanceAxios({
				method: "patch",
				url: `/event/edit-event/${pk}`,
				data: {
					title: formValues.title,
					content: formValues.content,
					slug: formValues.slug,
					short_description: formValues.short_description,
				},
			});
		} catch (error: any) {
			reportError(error, "funEditEvent", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcJoinEvent = async ({ eventPk }: { eventPk: number }) => {
		try {
			await instanceAxios({
				method: "post",
				url: `/event/join-event/${eventPk}`,
			});
		} catch (error: any) {
			reportError(error, "funcJoinEvent", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	return {
		funcCreateEvent,
		funEditEvent,
		funcJoinEvent,
	};
};
