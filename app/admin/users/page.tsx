import { Suspense } from "react";

import type { Metadata } from "next";

import { UsersList } from "@/components/pages/AdminUsers/UsersList";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Users- Admin- ${TRADING_NAME}`,
	description: `View and search all users in ${TRADING_NAME}.`,
};

export default function AdminUsersPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
					<Text variant="loading">Loading users…</Text>
				</div>
			}
		>
			<UsersList />
		</Suspense>
	);
}
