import type { MediaOutlet } from "@customTypes/mediaOutlet";
import type { ApiOpportunity } from "@customTypes/opportunity";
import { tipTapApiValueToPlainText } from "@lib/tiptap-utils";

export type Opportunity = {
	id: string;
	type: string;
	status: "open" | "closed";
	title: string;
	description: string;
	shortDescription: string;
	requirements: string[];
	deadline: string;
	interviewWindow: string;
	articleType: string;
	location: string;
	matchScore: number;
	reporter: {
		name: string;
		title: string;
		publication: string;
		bio: string;
		profileUrl: string;
		avatarUrl: string;
	};
	publication: {
		name: string;
		slug: string;
		url: string;
		category: string;
		monthlyReaders: string;
		printCirculation: string;
		founded: string;
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
	| "reporter"
	| "publication"
>;

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
		location: "Remote — phone or video call",
		reporter: {
			name: "Priya Mehta",
			title: "Senior Staff Writer",
			publication: "Fast Company",
			bio: "Priya covers the intersection of technology and work culture. Her features have appeared in Fast Company, Quartz, and MIT Technology Review.",
			profileUrl: "https://www.fastcompany.com",
			avatarUrl: "/opportunity/reporter.jpg",
		},
		publication: {
			name: "Fast Company",
			slug: "FC",
			url: "https://www.fastcompany.com",
			category: "Business & Technology",
			monthlyReaders: "9.4 million",
			printCirculation: "725,000 copies",
			founded: "1995 · New York, NY",
		},
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
		location: "Remote — Riverside or Zoom",
		reporter: {
			name: "Marcus Chen",
			title: "Host & Producer",
			publication: "The Growth Ledger",
			bio: "Marcus interviews founders and operators building category-defining companies. The show reaches 120k listeners per episode.",
			profileUrl: "https://example.com/growth-ledger",
			avatarUrl: "/opportunity/reporter.jpg",
		},
		publication: {
			name: "The Growth Ledger",
			slug: "TGL",
			url: "https://example.com/growth-ledger",
			category: "Business Podcast",
			monthlyReaders: "480,000 downloads",
			printCirculation: "N/A",
			founded: "2019 · Remote",
		},
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
		location: "London, UK — in person",
		reporter: {
			name: "Elena Rodriguez",
			title: "Programme Director",
			publication: "Future Work Summit",
			bio: "Elena curates speaker line-ups for Europe's leading future-of-work conference, drawing 2,000 attendees annually.",
			profileUrl: "https://example.com/future-work-summit",
			avatarUrl: "/opportunity/reporter.jpg",
		},
		publication: {
			name: "Future Work Summit",
			slug: "FWS",
			url: "https://example.com/future-work-summit",
			category: "Industry Conference",
			monthlyReaders: "2,000 attendees",
			printCirculation: "N/A",
			founded: "2016 · London, UK",
		},
	},
];

const pickMockTemplate = (pk: number): MockTemplate =>
	MOCK_TEMPLATES[pk % MOCK_TEMPLATES.length] ?? MOCK_TEMPLATES[0];

const publicationSlugFromName = (name: string): string => {
	const initials = name
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word[0]?.toUpperCase() ?? "")
		.join("");

	return initials.slice(0, 3) || "MO";
};

export const mapApiOpportunityToDisplay = (
	api: ApiOpportunity,
	mediaOutlet?: MediaOutlet | null,
): Opportunity => {
	const template = pickMockTemplate(api.pk);
	const shortDescription =
		api.short_description.trim() ||
		tipTapApiValueToPlainText(api.full_description);
	const description =
		tipTapApiValueToPlainText(api.full_description) ||
		api.short_description.trim();
	const publicationName =
		mediaOutlet?.name?.trim() ||
		api.media_outlet_name?.trim() ||
		template.publication.name;
	const publicationUrl =
		mediaOutlet?.website_url?.trim() || template.publication.url;

	return {
		id: String(api.pk),
		status: "open",
		title: api.title,
		shortDescription,
		description,
		matchScore: 70 + (api.pk % 28),
		...template,
		reporter: {
			...template.reporter,
			publication: publicationName,
		},
		publication: {
			...template.publication,
			name: publicationName,
			url: publicationUrl,
			slug: publicationSlugFromName(publicationName),
		},
	};
};

export const mapApiOpportunitiesToDisplay = (
	items: ApiOpportunity[],
): Opportunity[] => items.map((item) => mapApiOpportunityToDisplay(item));
