import type { Metadata } from "next";

import { AdminOpportunityDetail } from "@/components/pages/AdminOpportunities/AdminOpportunityDetail";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Opportunity- Admin- ${TRADING_NAME}`,
	description: `Review an opportunity in ${TRADING_NAME}.`,
};

export default function AdminOpportunityPage() {
	return <AdminOpportunityDetail />;
}
