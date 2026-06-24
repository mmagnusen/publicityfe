import type { Metadata } from "next";

import { CreateOpportunity } from "@/components/pages/Opportunities/CreateOpportunity";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `New opportunity- ${TRADING_NAME}`,
	description: `Create a new media opportunity in ${TRADING_NAME}.`,
};

export default function CreateOpportunityPage() {
	return <CreateOpportunity />;
}
