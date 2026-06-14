export type Opportunity = {
	id: string;
	type: string;
	status: "open" | "closed";
	title: string;
	description: string;
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

const opportunities: Record<string, Opportunity> = {
	"1": {
		id: "1",
		type: "Magazine Article",
		status: "open",
		title:
			"Seeking experts on the future of AI-powered personal branding for a feature in Fast Company",
		description:
			"We're putting together an in-depth feature for Fast Company's September issue on how founders, consultants, and creators are using AI tools to build and scale their personal brands. We're looking for practitioners with hands-on experience — not theorists. The piece will run 2,500–3,000 words with expert quotes woven throughout.",
		requirements: [
			"Someone actively using AI tools (ChatGPT, Jasper, etc.) in their own personal branding strategy",
			"A track record of measurable results — follower growth, press placements, speaking gigs",
			"Comfortable being quoted on the record with their name and company",
			"Available for a 20–30 min phone interview before 28 June 2026",
		],
		deadline: "Friday, 28 June 2026",
		interviewWindow: "16 – 27 June 2026",
		articleType: "Long-form feature (print + digital)",
		location: "Remote — phone or video call",
		matchScore: 94,
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
};

export function getOpportunity(pk: string): Opportunity | null {
	return opportunities[pk] ?? null;
}

export function getAllOpportunityIds(): string[] {
	return Object.keys(opportunities);
}
