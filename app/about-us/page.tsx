import type { Metadata } from "next";

import { LegalPageContent } from "@/components/legal-page-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `About us- ${TRADING_NAME}`,
	description: `Learn about ${TRADING_NAME} and our mission to help creators and businesses get discovered by media.`,
};

const sections = [
	{
		title: "Our mission",
		body: `${TRADING_NAME} connects creators, founders, and experts with journalists, podcast hosts, and event organizers who are actively looking for voices like theirs. We believe great stories deserve to be heard.`,
	},
	{
		title: "What we do",
		body: "We curate media opportunities, help you build a standout profile, and make it easier to discover relevant placements- from interviews and podcasts to panels and press features.",
	},
	{
		title: "Who we serve",
		body: `Whether you are a solo creator growing your personal brand or a business seeking earned media, ${TRADING_NAME} gives you a single place to browse opportunities, track applications, and build visibility.`,
	},
	{
		title: "Our approach",
		body: `We focus on quality matches over noise. ${TRADING_NAME} is designed to save you time, surface the right opportunities, and help you present your expertise clearly to media professionals.`,
	},
];

export default function AboutUsPage() {
	return (
		<LegalPageContent
			footnote="This page is a placeholder. A fuller company story and team section will be added soon."
			intro={`${TRADING_NAME} helps you promote yourself on interviews, podcasts, and media opportunities.`}
			pageTitle="About us"
			sections={sections}
		/>
	);
}
