export type ProfileLink = {
	label: string;
	href: string;
	type: "website" | "instagram" | "linkedin" | "facebook" | "twitter";
};

export type FeaturedIn = {
	publication: string;
	title: string;
	year: string;
	url: string;
};

export type FounderProfile = {
	id: string;
	name: string;
	role: string;
	company: string;
	location: string;
	avatarUrl: string;
	openToMedia: boolean;
	bio: string[];
	topics: string[];
	links: ProfileLink[];
	gallery: { src: string; alt: string; className?: string }[];
	featuredIn: FeaturedIn[];
};

const profiles: Record<string, FounderProfile> = {
	"1": {
		id: "1",
		name: "Zara Osei",
		role: "Founder & CEO",
		company: "Bloom Drinks",
		location: "London, UK",
		avatarUrl: "/profile/zara-osei.jpg",
		openToMedia: true,
		bio: [
			"Zara Osei is the founder and CEO of Bloom Drinks, the UK's fastest-growing alcohol-free spirits brand. After leaving a career in brand strategy at a major agency, she launched Bloom from her kitchen in 2021 with a single product and a clear mission: make alcohol-free drinking feel aspirational, not like a compromise.",
			"Under Zara's leadership, Bloom has grown to over 200 retail stockists, raised a Series A in 2024, and been featured in Forbes, Vogue Business, and The Grocer. She was named to Forbes 30 Under 30 in 2025 and speaks regularly on panels about the future of mindful drinking and building consumer brands from scratch.",
			"A vocal advocate for the sober-curious movement, Zara speaks regularly on panels, podcasts, and stages about building mission-driven brands, female founder fundraising, and the cultural shift away from alcohol.",
		],
		topics: [
			"Sober-curious movement & alcohol-free culture",
			"Female founder fundraising",
			"Building a CPG brand from zero",
			"Wellness & functional ingredients",
			"DTC & retail strategy",
			"Mindful drinking",
		],
		links: [
			{
				type: "website",
				label: "bloomdrinks.co",
				href: "https://bloomdrinks.co",
			},
			{
				type: "instagram",
				label: "@zaraosei",
				href: "https://instagram.com/zaraosei",
			},
			{
				type: "linkedin",
				label: "Zara Osei",
				href: "https://linkedin.com/in/zaraosei",
			},
			{
				type: "twitter",
				label: "@zaraosei",
				href: "https://twitter.com/zaraosei",
			},
		],
		gallery: [
			{
				src: "/profile/gallery-products.jpg",
				alt: "Bloom Drinks product bottles on a shelf",
				className: "col-span-2 row-span-1 sm:col-span-2",
			},
			{
				src: "/profile/gallery-speaking.jpg",
				alt: "Zara Osei speaking on stage at an event",
				className: "col-span-1 row-span-1",
			},
			{
				src: "/profile/gallery-can.jpg",
				alt: "Close-up of a Bloom Drinks can",
				className: "col-span-1 row-span-2",
			},
			{
				src: "/profile/gallery-ingredients.jpg",
				alt: "Botanical ingredients laid out flat",
				className: "col-span-1 row-span-1",
			},
			{
				src: "/profile/gallery-audience.jpg",
				alt: "Zara Osei speaking to a large audience",
				className: "col-span-1 row-span-1",
			},
		],
		featuredIn: [
			{
				publication: "Forbes",
				title: "The Woman Turning Sober-Curious Into a $50M Category",
				year: "2025",
				url: "https://www.forbes.com",
			},
			{
				publication: "Fast Company",
				title: "Bloom's Founder on Building a Brand Without the Booze",
				year: "2025",
				url: "https://www.fastcompany.com",
			},
			{
				publication: "Vogue Business",
				title: "Meet the Drinks Disruptors Reshaping Social Culture",
				year: "2024",
				url: "https://www.voguebusiness.com",
			},
			{
				publication: "Refinery29",
				title:
					"Why Gen Z Is Ditching Alcohol- and What Brands Are Doing About It",
				year: "2024",
				url: "https://www.refinery29.com",
			},
			{
				publication: "The Grocer",
				title: "Bloom Drinks: The Brand Making Alcohol-Free Cool",
				year: "2024",
				url: "https://www.thegrocer.co.uk",
			},
		],
	},
};

export function getProfile(pk: string): FounderProfile | null {
	return profiles[pk] ?? null;
}

export function getAllProfileIds(): string[] {
	return Object.keys(profiles);
}
