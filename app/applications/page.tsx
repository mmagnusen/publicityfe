import type { Metadata } from "next";

import { ApplicationsContent } from "@/components/applications-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Applications - ${TRADING_NAME}`,
	description: "Track your opportunity applications.",
};

export default function ApplicationsPage() {
	return <ApplicationsContent />;
}
