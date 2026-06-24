import type { MediaOutlet } from "@customTypes/mediaOutlet";
import type { ApiOpportunity } from "@customTypes/opportunity";
import type { PublicUser } from "@customTypes/publicUser";
import type { Tag } from "@customTypes/tag";
import {
	richTextDocFromApiField,
	tipTapApiValueToPlainText,
} from "@lib/tiptap-utils";
import type { JSONContent } from "@tiptap/react";

import { resolveBytescaleDisplayUrl } from "@/components/UploadButton";
import { profilePagePath, publicUserDisplayName } from "@/lib/publicUser";

export type Opportunity = {
	id: string;
	type: string;
	status: "open" | "closed";
	title: string;
	description: string;
	shortDescription: string;
	requirements: string[];
	hasApplicationDeadline: boolean;
	deadline: string;
	interviewWindow: string;
	articleType: string;
	location: string;
	matchScore: number;
	isFavorited: boolean;
	reporter: {
		name: string;
		title: string;
		publication: string;
		shortDescription: JSONContent | null;
		profileUrl: string;
		avatarUrl: string;
	};
	publication: {
		name: string;
		slug: string;
		url: string;
		foundedYear: number | null;
		tags: Tag[];
	};
};

type MockTemplate = Pick<
	Opportunity,
	| "type"
	| "requirements"
	| "deadline"
	| "interviewWindow"
	| "articleType"
	| "location"
>;

const DEFAULT_REPORTER_AVATAR = "/opportunity/reporter.jpg";

const MOCK_TEMPLATES: MockTemplate[] = [
	{
		type: "Magazine Article",
		requirements: [
			"Hands-on experience relevant to the topic",
			"A track record you can speak to on the record",
			"Available for a 20–30 minute interview",
		],
		deadline: "Friday, 28 June 2026",
		interviewWindow: "16 – 27 June 2026",
		articleType: "Long-form feature (print + digital)",
		location: "Remote- phone or video call",
	},
	{
		type: "Podcast Interview",
		requirements: [
			"Clear point of view and concrete examples",
			"Comfortable with a 45-minute recorded conversation",
			"Stable internet connection for remote recording",
		],
		deadline: "Wednesday, 9 July 2026",
		interviewWindow: "1 – 8 July 2026",
		articleType: "45-minute interview episode",
		location: "Remote- Riverside or Zoom",
	},
	{
		type: "Conference Panel",
		requirements: [
			"Subject-matter expert with speaking experience",
			"Available for a prep call and the live session",
			"Willing to share practical takeaways, not generic advice",
		],
		deadline: "Monday, 21 July 2026",
		interviewWindow: "14 – 20 July 2026",
		articleType: "45-minute panel discussion",
		location: "London, UK- in person",
	},
];

const pickMockTemplate = (pk: number): MockTemplate =>
	MOCK_TEMPLATES[pk % MOCK_TEMPLATES.length] ?? MOCK_TEMPLATES[0];

export const formatApplicationDeadlineDisplay = (
	applicationDeadline: string | null | undefined,
): string => {
	const trimmed = applicationDeadline?.trim();
	if (!trimmed) {
		return "";
	}

	const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})/);
	if (match) {
		const [, year, month, day, hour] = match;
		const date = new Date(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hour),
		);

		return date.toLocaleString("en-GB", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	const date = new Date(trimmed);
	if (Number.isNaN(date.getTime())) {
		return trimmed;
	}

	return date.toLocaleString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
};

const publicationSlugFromName = (name: string): string => {
	const initials = name
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word[0]?.toUpperCase() ?? "")
		.join("");

	return initials.slice(0, 3) || "MO";
};

export const mapMediaOutletToPublication = (
	outlet: MediaOutlet,
): Opportunity["publication"] => {
	const name = outlet.name.trim() || "Publication";

	return {
		name,
		slug: publicationSlugFromName(name),
		url: outlet.website_url.trim(),
		foundedYear: outlet.founded_year ?? null,
		tags: outlet.tags ?? [],
	};
};

export const publicationFromOpportunityFallback = (
	name: string,
	url = "",
): Opportunity["publication"] => {
	const trimmedName = name.trim() || "Publication";

	return {
		name: trimmedName,
		slug: publicationSlugFromName(trimmedName),
		url: url.trim(),
		foundedYear: null,
		tags: [],
	};
};

export const opportunityCreatorUsername = (
	api: ApiOpportunity,
): string | null => {
	const flatUsername = api.creator_username?.trim();
	if (flatUsername) {
		return flatUsername;
	}

	const creator = api.creator;
	if (creator != null && typeof creator === "object") {
		const nestedUsername = creator.username?.trim();
		if (nestedUsername) {
			return nestedUsername;
		}
	}

	return null;
};

export const opportunityCreatorPk = (api: ApiOpportunity): number | null => {
	const flatPk = api.creator_pk;
	if (flatPk != null && flatPk > 0) {
		return flatPk;
	}

	const creator = api.creator;
	if (typeof creator === "number" && creator > 0) {
		return creator;
	}

	if (creator != null && typeof creator === "object") {
		const nestedPk = creator.pk;
		if (nestedPk != null && nestedPk > 0) {
			return nestedPk;
		}
	}

	return null;
};

const profileShortDescriptionRichText = (
	user: PublicUser,
): JSONContent | null =>
	richTextDocFromApiField(user.human_profile?.short_description);

export const emptyReporter = (
	publicationName: string,
	profileUrl = "",
): Opportunity["reporter"] => ({
	name: "",
	title: "",
	publication: publicationName,
	shortDescription: null,
	profileUrl,
	avatarUrl: DEFAULT_REPORTER_AVATAR,
});

export const mapPublicUserToReporter = (
	user: PublicUser,
	publicationName: string,
): Opportunity["reporter"] => {
	const profile = user.human_profile;
	const avatarUrl =
		resolveBytescaleDisplayUrl(profile?.profile_image_url) ||
		DEFAULT_REPORTER_AVATAR;

	return {
		name: publicUserDisplayName(user),
		title: profile?.tagline?.trim() || "",
		publication: publicationName,
		shortDescription: profileShortDescriptionRichText(user),
		profileUrl: profilePagePath(user.username),
		avatarUrl,
	};
};

export const mapApiOpportunityToDisplay = (
	api: ApiOpportunity,
	mediaOutlet?: MediaOutlet | null,
): Opportunity => {
	const template = pickMockTemplate(api.pk);
	const shortDescription =
		api.short_description?.trim() ||
		tipTapApiValueToPlainText(api.full_description);
	const description =
		tipTapApiValueToPlainText(api.full_description) ||
		api.short_description?.trim() ||
		"";
	const publicationName =
		mediaOutlet?.name?.trim() || api.media_outlet_name?.trim() || "Publication";
	const publicationUrl = mediaOutlet?.website_url?.trim() || "";
	const creatorUsername = opportunityCreatorUsername(api);
	const publication = mediaOutlet
		? mapMediaOutletToPublication(mediaOutlet)
		: publicationFromOpportunityFallback(publicationName, publicationUrl);
	const applicationDeadline = api.application_deadline?.trim() || null;
	const hasApplicationDeadline = Boolean(applicationDeadline);

	return {
		id: String(api.pk),
		status: "open",
		title: api.title?.trim() || "Untitled opportunity",
		shortDescription,
		description,
		matchScore: 70 + (api.pk % 28),
		...template,
		hasApplicationDeadline,
		deadline: hasApplicationDeadline
			? formatApplicationDeadlineDisplay(applicationDeadline)
			: "",
		isFavorited: Boolean(api.is_favorited),
		reporter: emptyReporter(
			publicationName,
			creatorUsername ? profilePagePath(creatorUsername) : "",
		),
		publication,
	};
};

export const applyMediaOutletToOpportunity = (
	opportunity: Opportunity,
	mediaOutlet: MediaOutlet,
): Opportunity => {
	const publication = mapMediaOutletToPublication(mediaOutlet);

	return {
		...opportunity,
		publication,
		reporter: {
			...opportunity.reporter,
			publication: publication.name,
		},
	};
};

export const applyCreatorToOpportunity = (
	opportunity: Opportunity,
	creator: PublicUser,
): Opportunity => ({
	...opportunity,
	reporter: mapPublicUserToReporter(creator, opportunity.reporter.publication),
});

export const mapApiOpportunitiesToDisplay = (
	items: ApiOpportunity[],
): Opportunity[] => items.map((item) => mapApiOpportunityToDisplay(item));
