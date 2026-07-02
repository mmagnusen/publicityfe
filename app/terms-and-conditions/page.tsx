import type { Metadata } from "next";

import { LegalPageContent } from "@/components/legal-page-content";
import {
	COMPANY_LEGAL_NAME,
	COMPANY_NUMBER,
	CONTACT_EMAIL,
	LEGAL_EMAIL,
	REGISTERED_ADDRESS,
} from "@/constants/legal";
import { TRADING_NAME } from "@/constants/tradingName";

const brandName = TRADING_NAME || "Get Featured";

export const metadata: Metadata = {
	title: `Terms and conditions- ${brandName}`,
	description: `Terms and conditions for using ${brandName}.`,
};

const sections = [
	{
		title: "1. About these terms",
		body: [
			`These terms and conditions govern your use of ${brandName}, a platform that connects founders, creatives and professionals with press, podcast, panel and media opportunities. By creating an account or using our platform, you agree to these terms. If you do not agree, please do not use the platform.`,
		],
	},
	{
		title: "2. Your account",
		body: [
			`To use ${brandName} you must create an account. You are responsible for keeping your login details secure and for all activity that takes place under your account. You must be at least 18 years old to create an account. You agree to provide accurate and up-to-date information when registering and to keep your profile information current.`,
			"We reserve the right to suspend or terminate your account if we believe you have breached these terms or are using the platform in a way that is harmful to other users or to us.",
		],
	},
	{
		title: "3. Subscriptions and payment",
		body: [
			`${brandName} operates on a monthly subscription basis. Subscription fees are charged in advance on a recurring monthly basis. Current pricing is displayed on our pricing page and may be updated from time to time with reasonable notice.`,
			"Payments are processed securely by Stripe. By subscribing you authorise us to charge your payment method on a recurring basis until you cancel.",
			"You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period. We do not offer refunds for partially used billing periods except where required by law.",
			"If a payment fails, we will notify you and attempt to collect payment again. If payment cannot be collected we reserve the right to suspend access to your account until the balance is cleared.",
		],
	},
	{
		title: "4. Free trials and promotional offers",
		body: "We may offer free trials or promotional discounts from time to time, including through our referral programme. Free trial periods convert automatically to a paid subscription at the end of the trial unless you cancel before the trial ends. Promotional offers are subject to any additional terms stated at the time of the offer and cannot be combined unless explicitly stated.",
	},
	{
		title: "5. Use of the platform",
		body: [
			`You agree to use ${brandName} only for lawful purposes and in a way that does not infringe the rights of others. You must not use the platform to submit false or misleading information, impersonate another person or organisation, spam or harass media contacts or other users, scrape or harvest data from the platform, or attempt to gain unauthorised access to any part of the platform.`,
			"We reserve the right to remove any content or applications that we consider to be in breach of these terms or otherwise inappropriate.",
		],
	},
	{
		title: "6. Opportunities and applications",
		body: [
			`${brandName} provides a platform for connecting users with media opportunities. We do not guarantee that any application will result in coverage, an interview, a speaking slot, or any other outcome. We are not responsible for the decisions made by media outlets, journalists, podcast hosts or event organisers in relation to applications submitted through the platform.`,
			`Media opportunities are posted in good faith. We take reasonable steps to verify outlets and contacts but cannot guarantee the accuracy of all listings. If you believe an opportunity is inaccurate or fraudulent, please report it to us at ${CONTACT_EMAIL}.`,
		],
	},
	{
		title: "7. Your content",
		body: [
			`When you submit content to ${brandName} - including your profile information, pitch text, and any supporting materials - you grant us a non-exclusive licence to display and use that content for the purposes of operating the platform. You retain ownership of your content.`,
			"You are responsible for ensuring that any content you submit does not infringe the intellectual property rights of any third party and does not contain anything that is unlawful, defamatory, or offensive.",
		],
	},
	{
		title: "8. Our content",
		body: `All content on ${brandName} that is not user-generated - including the design, layout, text, graphics and software - is owned by us or our licensors and is protected by intellectual property law. You may not copy, reproduce or distribute any part of the platform without our written permission.`,
	},
	{
		title: "9. Limitation of liability",
		body: [
			`To the fullest extent permitted by law, ${brandName} shall not be liable for any indirect, incidental, or consequential loss arising from your use of the platform, including loss of earnings, loss of opportunity, or damage to reputation. Our total liability to you in any circumstances shall not exceed the total amount you have paid to us in the three months preceding the claim.`,
			"Nothing in these terms limits our liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.",
		],
	},
	{
		title: "10. Indemnity",
		body: `You agree to indemnify and hold ${brandName} harmless from any claims, losses, or damages arising from your use of the platform, your breach of these terms, or any content you submit through the platform.`,
	},
	{
		title: "11. Changes to the platform and these terms",
		body: [
			"We may update these terms from time to time. If we make material changes we will notify you by email or by a notice on the platform at least 14 days before the changes take effect. Your continued use of the platform after that date constitutes acceptance of the updated terms.",
			"We may also update, modify or discontinue features of the platform at any time. We will give reasonable notice of any significant changes that affect your use of the service.",
		],
	},
	{
		title: "12. Governing law",
		body: "These terms are governed by the laws of England and Wales. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
	},
	{
		title: "13. Contact",
		body: `If you have any questions about these terms, please contact us at ${LEGAL_EMAIL}.`,
	},
];

export default function TermsAndConditionsPage() {
	return (
		<LegalPageContent
			intro="Last updated: June 2026"
			pageTitle="Terms and conditions"
			sections={sections}
		/>
	);
}
