import type { Metadata } from "next";

import { DashboardContent } from "@/components/dashboard-content";
import { TRADING_NAME, tradingNamePageTitle } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: tradingNamePageTitle("Dashboard"),
	description: `Manage your ${TRADING_NAME} opportunities and profile.`,
};

export default function DashboardPage() {
	return <DashboardContent />;
}
