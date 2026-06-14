import useSWR from "swr";

import type {
	AdminChatMessagesChannelResponse,
	AdminChatMessagesThreadResponse,
} from "@customTypes/adminChatModeration";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

export const ADMIN_CHAT_MESSAGES_PER_PAGE = 50;

export type AdminChatMessageMode = "channel" | "thread";

export const adminChatMessagesKey = (
	mode: AdminChatMessageMode,
	page: number,
	perPage: number,
	senderId?: number | null,
	searchQuery?: string | null,
) => {
	const q = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
		type: mode,
	});
	if (senderId != null) {
		q.set("sender", String(senderId));
	}
	const term = searchQuery?.trim();
	if (term) {
		q.set("content", term);
	}
	return `/chat/admin/messages?${q.toString()}`;
};

export type UseAdminChatMessagesOptions = {
	/** Restrict to messages from this user (pk). Omitted when null/undefined. */
	senderId?: number | null;
	/** Case-insensitive substring search on message body (maps to ?content=). */
	searchQuery?: string | null;
	/** When false, SWR is suspended (e.g. invalid sender input). */
	enabled?: boolean;
};

export const useAdminChatMessages = (
	mode: AdminChatMessageMode,
	page: number,
	perPage: number = ADMIN_CHAT_MESSAGES_PER_PAGE,
	options?: UseAdminChatMessagesOptions,
) => {
	const senderId = options?.senderId ?? null;
	const searchQuery = options?.searchQuery ?? null;
	const enabled = options?.enabled ?? true;
	const { isLoggedIn, isAdmin } = useAuthenticatedUser();
	const key =
		isLoggedIn && isAdmin && enabled
			? adminChatMessagesKey(mode, page, perPage, senderId, searchQuery)
			: null;
	return useSWR<
		AdminChatMessagesChannelResponse | AdminChatMessagesThreadResponse
	>(key, fetcher);
};
