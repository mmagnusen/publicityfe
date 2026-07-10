import type { Metadata } from "next";

import { ReceivedApplicationDetailContent } from "@/components/received-application-detail-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `View application - ${TRADING_NAME}`,
	description: "Review a pitch submitted to your opportunity.",
};

export default function ReceivedApplicationDetailPage() {
	return <ReceivedApplicationDetailContent />;
}
