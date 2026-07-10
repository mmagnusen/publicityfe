import type { Metadata } from "next";

import { ReceivedApplicationsContent } from "@/components/received-applications-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Applications received - ${TRADING_NAME}`,
	description: "Pitches submitted to your opportunities.",
};

export default function ApplicationsReceivedPage() {
	return <ReceivedApplicationsContent />;
}
