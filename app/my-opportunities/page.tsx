import type { Metadata } from "next";

import { MyOpportunitiesContent } from "@/components/my-opportunities-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `My opportunities - ${TRADING_NAME}`,
	description: "Opportunities you have created.",
};

export default function MyOpportunitiesPage() {
	return <MyOpportunitiesContent />;
}
