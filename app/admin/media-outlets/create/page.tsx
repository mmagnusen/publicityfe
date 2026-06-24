import type { Metadata } from "next";

import { CreateMediaOutlet } from "@/components/pages/AdminMediaOutlets/CreateMediaOutlet";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `New media outlet- Admin- ${TRADING_NAME}`,
	description: `Create a new media outlet in ${TRADING_NAME}.`,
};

export default function AdminCreateMediaOutletPage() {
	return <CreateMediaOutlet />;
}
