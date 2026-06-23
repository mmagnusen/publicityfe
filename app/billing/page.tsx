import type { Metadata } from "next";

import { BillingContent } from "@/components/billing-content";

export const metadata: Metadata = {
	title: "Billing — Spotlight",
	description:
		"Manage your Spotlight subscription, payment method, and invoices.",
};

export default function BillingPage() {
	return <BillingContent />;
}
