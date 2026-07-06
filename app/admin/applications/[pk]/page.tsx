import type { Metadata } from "next";

import { AdminApplicationDetail } from "@/components/pages/AdminApplications/AdminApplicationDetail";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Application- Admin- ${TRADING_NAME}`,
	description: `Review an opportunity application in ${TRADING_NAME}.`,
};

export default function AdminApplicationPage() {
	return <AdminApplicationDetail />;
}
