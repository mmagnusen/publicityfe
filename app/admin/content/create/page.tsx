import type { Metadata } from "next";

import { CreateContent } from "@/components/pages/AdminContent/CreateContent";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `New content- Admin- ${TRADING_NAME}`,
	description: `Create a content template in ${TRADING_NAME}.`,
};

export default function AdminCreateContentPage() {
	return <CreateContent />;
}
