import type { Metadata } from "next";

import { EditTag } from "@/components/pages/AdminTags/EditTag";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Edit tag- Admin- ${TRADING_NAME}`,
	description: `Edit a tag in ${TRADING_NAME}.`,
};

export default function AdminEditTagPage() {
	return <EditTag />;
}
