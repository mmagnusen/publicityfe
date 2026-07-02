import type { Metadata } from "next";

import { LegalPageContent } from "@/components/legal-page-content";
import { PRIVACY_EMAIL, SITE_URL } from "@/constants/socialMedia";
import { TRADING_NAME } from "@/constants/tradingName";

const brandName = TRADING_NAME || "Get Featured";

export const metadata: Metadata = {
	title: `Privacy policy- ${brandName}`,
	description: `How ${brandName} collects, uses, and protects your personal data.`,
};

const sections = [
	{
		title: "Who we are",
		body: `We are ${brandName}, a platform that connects founders, creatives and professionals with press, podcast, panel and media opportunities. If you have any questions about this policy, you can contact us at ${PRIVACY_EMAIL}.`,
	},
	{
		title: "What information we collect",
		body: [
			"We collect information you provide directly to us when you create an account, fill in your profile, submit an application to an opportunity, or contact us. This includes your name, email address, job title, company name, website, and any other information you choose to include in your profile or pitches.",
			"We also collect information automatically when you use our platform, including your IP address, browser type, pages visited, and how you interact with the site. We use cookies to support this - see our cookie section below.",
			"If you subscribe to a paid plan, your payment is processed by Stripe. We do not store your card details on our servers.",
		],
	},
	{
		title: "How we use your information",
		body: [
			"We use the information we collect to provide and improve the platform, match you with relevant opportunities, send you notifications about new opportunities, process your subscription, respond to your enquiries, and comply with our legal obligations.",
			"We do not sell your personal data to third parties. We do not use your data for advertising purposes.",
		],
	},
	{
		title: "Who we share your information with",
		body: [
			"We share limited information with third party service providers who help us run the platform, including Stripe for payment processing, and email delivery providers. These providers are contractually required to keep your information secure and only use it for the purposes we specify.",
			"When you apply to an opportunity, the media contact or outlet associated with that opportunity will be able to see the information included in your pitch and your public profile.",
		],
	},
	{
		title: "How long we keep your information",
		body: "We keep your account information for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required to retain it for legal or financial reasons.",
	},
	{
		title: "Your rights",
		body: `Under UK GDPR you have the right to access the personal data we hold about you, request that we correct inaccurate data, request that we delete your data, object to or restrict how we process your data, and request a copy of your data in a portable format. To exercise any of these rights, contact us at ${PRIVACY_EMAIL}. We will respond within 30 days.`,
	},
	{
		title: "Cookies",
		body: "We use essential cookies to keep you logged in and make the platform work. We also use analytics cookies to understand how people use the site so we can improve it. You can manage your cookie preferences at any time via the cookie settings link in the footer.",
	},
	{
		title: "Security",
		body: "We take reasonable technical and organisational measures to protect your personal data. However, no method of transmission over the internet is completely secure and we cannot guarantee absolute security.",
	},
	{
		title: "Changes to this policy",
		body: "We may update this policy from time to time. If we make significant changes we will notify you by email or by a notice on the platform. The date at the top of this policy will always reflect the most recent update.",
	},
	{
		title: "Contact",
		body: `If you have any questions or concerns about how we handle your data, please contact us at ${PRIVACY_EMAIL}. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at https://ico.org.uk.`,
	},
];

export default function PrivacyPolicyPage() {
	return (
		<LegalPageContent
			intro="Last updated: June 2026"
			pageTitle="Privacy policy"
			sections={sections}
		/>
	);
}
