import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import type { AdminChannelMessagesResponse } from "@customTypes/adminChatModeration";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import type { Channel, ChatMessage } from "@hooks/useChat";
import { instanceAxios } from "@util/instanceAxios";

export const ADMIN_CHANNEL_CHAT_MESSAGES_PER_PAGE = 50;

export const adminChannelMessagesPath = (channelPk: number) =>
	`/chat/admin/channels/${channelPk}/messages`;

const mergeOlderPage = (
	existing: ChatMessage[],
	pageResults: ChatMessage[],
): ChatMessage[] => {
	const oldestFirst = [...pageResults].reverse();
	const existingPks = new Set(existing.map((m) => m.pk));
	const older = oldestFirst.filter((m) => !existingPks.has(m.pk));
	return [...older, ...existing];
};

export const useAdminChannelChatMessages = (channelPk: number | null) => {
	const { isLoggedIn, isAdmin } = useAuthenticatedUser();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [channel, setChannel] = useState<Channel | undefined>();
	const [nextUrl, setNextUrl] = useState<string | null>(null);
	const [count, setCount] = useState<number | null>(null);
	const [isLoadingInitial, setIsLoadingInitial] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [isLoadingAll, setIsLoadingAll] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const nextUrlRef = useRef<string | null>(null);

	useEffect(() => {
		nextUrlRef.current = nextUrl;
	}, [nextUrl]);

	const applyPage = useCallback((data: AdminChannelMessagesResponse) => {
		const pageResults = data.results ?? [];
		setMessages((prev) =>
			prev.length === 0
				? [...pageResults].reverse()
				: mergeOlderPage(prev, pageResults),
		);
		const next = data.next ?? null;
		setNextUrl(next);
		nextUrlRef.current = next;
		if (data.count != null) setCount(data.count);
		if (data.channel) setChannel(data.channel);
	}, []);

	const loadInitial = useCallback(async () => {
		if (channelPk == null || !isLoggedIn || !isAdmin) return;
		setIsLoadingInitial(true);
		setError(null);
		setMessages([]);
		setChannel(undefined);
		setNextUrl(null);
		setCount(null);
		try {
			const { data } = await instanceAxios<AdminChannelMessagesResponse>({
				method: "get",
				url: adminChannelMessagesPath(channelPk),
				params: {
					per_page: ADMIN_CHANNEL_CHAT_MESSAGES_PER_PAGE,
					page: 1,
				},
			});
			applyPage(data);
		} catch (err) {
			setError(err);
		} finally {
			setIsLoadingInitial(false);
		}
	}, [applyPage, channelPk, isAdmin, isLoggedIn]);

	useEffect(() => {
		void loadInitial();
	}, [loadInitial]);

	const loadMore = useCallback(async () => {
		const url = nextUrlRef.current;
		if (!url || isLoadingMore || isLoadingAll) return;
		setIsLoadingMore(true);
		setError(null);
		try {
			const { data } = await instanceAxios<AdminChannelMessagesResponse>({
				method: "get",
				url,
			});
			applyPage(data);
		} catch (err) {
			setError(err);
		} finally {
			setIsLoadingMore(false);
		}
	}, [applyPage, isLoadingAll, isLoadingMore]);

	const loadAll = useCallback(async () => {
		if (isLoadingMore || isLoadingAll) return;
		setIsLoadingAll(true);
		setError(null);
		try {
			let url: string | null = nextUrlRef.current;
			while (url) {
				const { data } = await instanceAxios<AdminChannelMessagesResponse>({
					method: "get",
					url,
				});
				const pageResults = data.results ?? [];
				setMessages((prev) =>
					prev.length === 0 && pageResults.length > 0
						? [...pageResults].reverse()
						: mergeOlderPage(prev, pageResults),
				);
				url = data.next ?? null;
				setNextUrl(url);
				nextUrlRef.current = url;
				if (data.count != null) setCount(data.count);
				if (data.channel) setChannel(data.channel);
			}
		} catch (err) {
			setError(err);
		} finally {
			setIsLoadingAll(false);
		}
	}, [isLoadingAll, isLoadingMore]);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	const notFound = axios.isAxiosError(error) && error.response?.status === 404;

	return {
		messages,
		channel,
		count,
		hasMore: Boolean(nextUrl),
		isLoadingInitial,
		isLoadingMore,
		isLoadingAll,
		error,
		accessDenied,
		notFound,
		loadInitial,
		loadMore,
		loadAll,
	};
};
