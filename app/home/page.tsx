import type { Metadata } from "next";

import { MarketingHomeContent } from "@/components/marketing-home-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `${TRADING_NAME}- Promote yourself on interviews`,
	description:
		"Connect with journalists, podcast hosts, and event organizers actively looking for experts like you.",
};

export default function HomePage() {
	return <MarketingHomeContent />;
}
