import { Suspense } from "react";

import type { Metadata } from "next";

import { AdminApplicationsList } from "@/components/pages/AdminApplications/AdminApplicationsList";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `All applications- Admin- ${TRADING_NAME}`,
	description: `View all opportunity applications in ${TRADING_NAME}.`,
};

export default function AdminApplicationsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
					<Text variant="loading">Loading applications…</Text>
				</div>
			}
		>
			<AdminApplicationsList />
		</Suspense>
	);
}
