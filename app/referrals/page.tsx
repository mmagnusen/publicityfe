import type { Metadata } from "next";

import { ReferralsContent } from "@/components/referrals-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Referrals - ${TRADING_NAME}`,
	description: `Invite friends to ${TRADING_NAME} and earn referral credits.`,
};

export default function ReferralsPage() {
	return <ReferralsContent />;
}
