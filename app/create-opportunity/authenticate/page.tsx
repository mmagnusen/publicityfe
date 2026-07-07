import type { Metadata } from "next";

import { CreateOpportunityAuthenticatePageContent } from "@/components/pages/Opportunities/CreateOpportunityAuthenticatePageContent";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Sign in to post an opportunity- ${TRADING_NAME}`,
	description: `Create an account or sign in to post a media opportunity on ${TRADING_NAME}.`,
};

export default function CreateOpportunityAuthenticatePage() {
	return <CreateOpportunityAuthenticatePageContent />;
}
