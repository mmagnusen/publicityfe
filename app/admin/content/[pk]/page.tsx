import type { Metadata } from "next";

import { EditContent } from "@/components/pages/AdminContent/EditContent";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Edit content- Admin- ${TRADING_NAME}`,
	description: `Edit a content template in ${TRADING_NAME}.`,
};

export default function AdminEditContentPage() {
	return <EditContent />;
}
