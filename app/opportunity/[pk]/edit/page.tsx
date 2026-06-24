import type { Metadata } from "next";

import { EditOpportunity } from "@/components/pages/Opportunities/EditOpportunity";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Edit opportunity- ${TRADING_NAME}`,
	description: `Edit a media opportunity in ${TRADING_NAME}.`,
};

export default function EditOpportunityPage() {
	return <EditOpportunity />;
}
