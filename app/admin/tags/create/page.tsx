import type { Metadata } from "next";

import { CreateTag } from "@/components/pages/AdminTags/CreateTag";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `New tag- Admin- ${TRADING_NAME}`,
	description: `Create a new tag in ${TRADING_NAME}.`,
};

export default function AdminCreateTagPage() {
	return <CreateTag />;
}
