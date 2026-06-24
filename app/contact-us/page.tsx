import type { Metadata } from "next";

import { ContactUsContent } from "@/components/contact-us-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Contact us- ${TRADING_NAME}`,
	description: `Get in touch with the ${TRADING_NAME} support team.`,
};

export default function ContactUsPage() {
	return <ContactUsContent />;
}
