import type { Metadata } from "next";

import { CreateUserOpportunity } from "@/components/pages/Opportunities/CreateUserOpportunity";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Post an opportunity- ${TRADING_NAME}`,
	description: `Post a media opportunity on ${TRADING_NAME}.`,
};

export default function CreateOpportunityPage() {
	return <CreateUserOpportunity />;
}
