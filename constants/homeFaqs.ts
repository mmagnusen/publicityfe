import { TRADING_NAME } from "@/constants/tradingName";

const brandName = TRADING_NAME || "Get Featured";

export type HomeFaq = {
	question: string;
	answer: string;
};

export const homeFaqs: HomeFaq[] = [
	{
		question: `What is ${brandName}?`,
		answer: `${brandName} connects founders, creatives and industry experts with journalists, podcast hosts and event organisers who are actively looking for people to feature. Browse opportunities, send pitches, and manage everything from one place.`,
	},
	{
		question: "Who is it for?",
		answer:
			"Founders, freelancers, consultants, creatives and subject-matter experts who want press coverage, podcast interviews, panel spots or speaking gigs - without hiring a traditional PR agency.",
	},
	{
		question: "How do opportunities work?",
		answer:
			"Opportunities are posted directly by journalists, editors, podcast hosts and organisers. You browse what's live, read the brief, and send a pitch through the platform when something fits your profile.",
	},
	{
		question: "Are the opportunities verified?",
		answer:
			"Yes. Every opportunity is reviewed before it goes live, so you're pitching to real outlets and legitimate requests - not spam listings or outdated calls for contributors.",
	},
	{
		question: "How much does it cost?",
		answer: `${brandName} uses simple flat pricing - one monthly subscription with no commission on deals you land and no percentage taken from speaking fees. What you earn is yours.`,
	},
	{
		question: "Do I need PR experience to get started?",
		answer:
			"No. Your profile acts as your media CV, and each opportunity includes enough context to help you write a focused pitch.",
	},
];
