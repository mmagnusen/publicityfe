import type { Metadata } from "next";

import { LegalPageContent } from "@/components/legal-page-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Terms and conditions- ${TRADING_NAME}`,
	description: `Terms and conditions for using ${TRADING_NAME}.`,
};

const sections = [
	{
		title: "Acceptance of terms",
		body: `By accessing or using ${TRADING_NAME}, you agree to be bound by these terms and conditions. If you do not agree, please do not use the service.`,
	},
	{
		title: "Use of the service",
		body: `${TRADING_NAME} helps creators and businesses discover and apply for media opportunities. You are responsible for the accuracy of information you submit and for complying with applicable laws when using the platform.`,
	},
	{
		title: "Accounts and subscriptions",
		body: "You must provide accurate registration details and keep your account secure. Paid plans, billing, and cancellations are governed by the pricing and payment terms shown at checkout.",
	},
	{
		title: "Content and conduct",
		body: `You retain ownership of content you submit, but grant ${TRADING_NAME} a licence to display it in connection with the service. You must not post unlawful, misleading, or harmful material.`,
	},
	{
		title: "Limitation of liability",
		body: `${TRADING_NAME} is provided on an as-is basis. To the extent permitted by law, we are not liable for indirect or consequential losses arising from your use of the platform.`,
	},
	{
		title: "Changes to these terms",
		body: `We may update these terms from time to time. Continued use of ${TRADING_NAME} after changes take effect constitutes acceptance of the revised terms.`,
	},
];

export default function TermsAndConditionsPage() {
	return (
		<LegalPageContent
			intro={`Please read these terms carefully before using ${TRADING_NAME}.`}
			pageTitle="Terms and conditions"
			sections={sections}
		/>
	);
}
