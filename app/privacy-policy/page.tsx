import type { Metadata } from "next";

import { LegalPageContent } from "@/components/legal-page-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Privacy policy- ${TRADING_NAME}`,
	description: `How ${TRADING_NAME} collects, uses, and protects your personal data.`,
};

const sections = [
	{
		title: "Who we are",
		body: `${TRADING_NAME} is operated by Delphi Community Ltd. This policy explains how we handle personal data when you use our website and services.`,
	},
	{
		title: "Data we collect",
		body: "We may collect information you provide when registering, creating a profile, applying for opportunities, or contacting support. We also collect technical data such as device information and usage analytics.",
	},
	{
		title: "How we use your data",
		body: `We use personal data to provide and improve ${TRADING_NAME}, process subscriptions, match you with relevant opportunities, communicate with you, and keep the platform secure.`,
	},
	{
		title: "Legal bases",
		body: "Where applicable, we process personal data on the basis of contract performance, legitimate interests, consent, or legal obligation, depending on the activity.",
	},
	{
		title: "Sharing and retention",
		body: `We share data with service providers who help us operate ${TRADING_NAME} (for example payment and hosting providers) and where required by law. We retain data only as long as needed for the purposes described in this policy.`,
	},
	{
		title: "Your rights",
		body: "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, and to object to certain processing or withdraw consent.",
	},
	{
		title: "Contact",
		body: "If you have questions about this privacy policy or wish to exercise your rights, please contact us through the support channels provided on the platform.",
	},
];

export default function PrivacyPolicyPage() {
	return (
		<LegalPageContent
			intro={`This policy describes how ${TRADING_NAME} handles your personal information.`}
			pageTitle="Privacy policy"
			sections={sections}
		/>
	);
}
