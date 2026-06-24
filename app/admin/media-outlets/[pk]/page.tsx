import type { Metadata } from "next";

import { EditMediaOutlet } from "@/components/pages/AdminMediaOutlets/EditMediaOutlet";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Edit media outlet- Admin- ${TRADING_NAME}`,
	description: `Edit a media outlet in ${TRADING_NAME}.`,
};

export default function AdminEditMediaOutletPage() {
	return <EditMediaOutlet />;
}
