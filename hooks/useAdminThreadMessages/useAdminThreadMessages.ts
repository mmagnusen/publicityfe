import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import type {
	AdminThreadMessagesResponse,
	AdminThreadParentSummary,
} from "@customTypes/adminChatModeration";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import type { Channel, ThreadMessage } from "@hooks/useChat";
import { instanceAxios } from "@util/instanceAxios";

export const ADMIN_THREAD_MESSAGES_PER_PAGE = 50;

export const adminThreadMessagesPath = (parentMessagePk: number) =>
	`/chat/admin/threads/${parentMessagePk}/messages`;

const mergeOlderThreadPage = (
	existing: ThreadMessage[],
	pageResults: ThreadMessage[],
): ThreadMessage[] => {
	const oldestFirst = [...pageResults].reverse();
	const existingPks = new Set(existing.map((m) => m.pk));
	const older = oldestFirst.filter((m) => !existingPks.has(m.pk));
	return [...older, ...existing];
};

/** Staff thread history via GET /chat/admin/threads/<parent_pk>/messages. */
export const useAdminThreadMessages = (parentMessagePk: number | null) => {
	const { isLoggedIn, isAdmin } = useAuthenticatedUser();
	const [messages, setMessages] = useState<ThreadMessage[]>([]);
	const [parentMessage, setParentMessage] =
		useState<AdminThreadParentSummary>();
	const [channel, setChannel] = useState<Channel | undefined>();
	const [nextUrl, setNextUrl] = useState<string | null>(null);
	const [count, setCount] = useState<number | null>(null);
	const [isLoadingInitial, setIsLoadingInitial] = useState(
		() => parentMessagePk != null,
	);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const nextUrlRef = useRef<string | null>(null);
	const fetchGenerationRef = useRef(0);

	useEffect(() => {
		nextUrlRef.current = nextUrl;
	}, [nextUrl]);

	const applyPage = useCallback((data: AdminThreadMessagesResponse) => {
		const pageResults = data.results ?? [];
		setMessages((prev) =>
			prev.length === 0
				? [...pageResults].reverse()
				: mergeOlderThreadPage(prev, pageResults),
		);
		const next = data.next ?? null;
		setNextUrl(next);
		nextUrlRef.current = next;
		if (data.count != null) setCount(data.count);
		if (data.parent_message) setParentMessage(data.parent_message);
		if (data.channel) setChannel(data.channel);
	}, []);

	const loadInitial = useCallback(async () => {
		if (parentMessagePk == null || !isLoggedIn || !isAdmin) return;
		const generation = ++fetchGenerationRef.current;
		setIsLoadingInitial(true);
		setError(null);
		setMessages([]);
		setParentMessage(undefined);
		setChannel(undefined);
		setNextUrl(null);
		setCount(null);
		try {
			const { data } = await instanceAxios<AdminThreadMessagesResponse>({
				method: "get",
				url: adminThreadMessagesPath(parentMessagePk),
				params: {
					per_page: ADMIN_THREAD_MESSAGES_PER_PAGE,
					page: 1,
				},
			});
			if (generation !== fetchGenerationRef.current) return;
			applyPage(data);
		} catch (err) {
			if (generation === fetchGenerationRef.current) {
				setError(err);
			}
		} finally {
			if (generation === fetchGenerationRef.current) {
				setIsLoadingInitial(false);
			}
		}
	}, [applyPage, isAdmin, isLoggedIn, parentMessagePk]);

	useEffect(() => {
		void loadInitial();
	}, [loadInitial]);

	/** Loads the next page and returns oldest-first batch for Virtuoso prepend. */
	const loadMore = useCallback(async (): Promise<ThreadMessage[] | null> => {
		const url = nextUrlRef.current;
		if (!url || isLoadingMore || parentMessagePk == null) return null;
		const generation = fetchGenerationRef.current;
		setIsLoadingMore(true);
		setError(null);
		try {
			const { data } = await instanceAxios<AdminThreadMessagesResponse>({
				method: "get",
				url,
			});
			if (generation !== fetchGenerationRef.current) return null;
			const pageResults = data.results ?? [];
			const oldestFirst = [...pageResults].reverse();
			const existingPks = new Set(messages.map((m) => m.pk));
			const older = oldestFirst.filter((m) => !existingPks.has(m.pk));
			applyPage(data);
			return older.length > 0 ? older : null;
		} catch (err) {
			if (generation === fetchGenerationRef.current) {
				setError(err);
			}
			return null;
		} finally {
			if (generation === fetchGenerationRef.current) {
				setIsLoadingMore(false);
			}
		}
	}, [applyPage, isLoadingMore, messages, parentMessagePk]);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	const notFound = axios.isAxiosError(error) && error.response?.status === 404;

	return {
		messages,
		parentMessage,
		channel,
		nextUrl,
		count,
		hasMore: Boolean(nextUrl),
		isLoadingInitial,
		isLoadingMore,
		error,
		accessDenied,
		notFound,
		loadInitial,
		loadMore,
	};
};

export type { AdminThreadParentSummary };
