import useSWR from "swr";

import type { AdminUserContributedChannelsResponse } from "@customTypes/adminChatModeration";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

export const ADMIN_USER_CONTRIBUTED_CHANNELS_PER_PAGE = 20;

export const adminUserContributedChannelsKey = (
	userPk: number,
	page: number,
	perPage: number = ADMIN_USER_CONTRIBUTED_CHANNELS_PER_PAGE,
) => {
	const q = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `/chat/admin/users/${userPk}/channels?${q.toString()}`;
};

export const useAdminUserContributedChannels = (
	userPk: number | null,
	page: number,
) => {
	const { isLoggedIn, isAdmin } = useAuthenticatedUser();
	const key =
		isLoggedIn && isAdmin && userPk != null
			? adminUserContributedChannelsKey(userPk, page)
			: null;
	return useSWR<AdminUserContributedChannelsResponse>(key, fetcher);
};
