import type { Metadata } from "next";

import { BillingContent } from "@/components/billing-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Billing- ${TRADING_NAME}`,
	description: `Manage your ${TRADING_NAME} subscription, payment method, and invoices.`,
};

export default function BillingPage() {
	return <BillingContent />;
}
