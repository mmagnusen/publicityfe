import type { Metadata } from "next";

import { ComingSoonContent } from "@/components/coming-soon-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `${TRADING_NAME}- Coming soon`,
	description: `${TRADING_NAME} is launching soon. Join the waitlist to hear when we're live.`,
};

export default function Page() {
	return <ComingSoonContent />;
}
