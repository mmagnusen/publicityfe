import type { Metadata } from "next";

import { TRADING_NAME } from "@/constants/tradingName";
import { AdminEditOpportunityPageContent } from "./AdminEditOpportunityPageContent";

export const metadata: Metadata = {
	title: `Edit opportunity- Admin- ${TRADING_NAME}`,
	description: `Edit a media opportunity in ${TRADING_NAME}.`,
};

export default function AdminEditOpportunityPage() {
	return <AdminEditOpportunityPageContent />;
}
