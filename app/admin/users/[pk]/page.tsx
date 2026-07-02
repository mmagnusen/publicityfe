import type { Metadata } from "next";

import { UserDetail } from "@/components/pages/AdminUsers/UserDetail";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `User- Admin- ${TRADING_NAME}`,
	description: `View user details in ${TRADING_NAME}.`,
};

export default function AdminUserDetailPage() {
	return <UserDetail />;
}
