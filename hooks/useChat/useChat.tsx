import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import axios from "axios";
import { noop } from "lodash-es";
import { useRouter } from "next/router";
import useSWR from "swr";

import type { User } from "@constants/user";
import data from "@emoji-mart/data";
import type { AdType } from "@hooks/useAdvertisement";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import useErrorReport from "@hooks/useErrorReport";
import { useLogs } from "@hooks/useLogs";
import usePosthog from "@hooks/usePosthog";
import { usePusherConnection } from "@hooks/usePusherConnection";
import { buildAxiosTransportDiagnostics } from "@util/errorReporting";
import fetcher from "@util/fetcher";
import { instanceAxios } from "@util/instanceAxios";
import pusher from "@util/pusher";
import type {
	ListScrollLocation,
	VirtuosoMessageListMethods,
} from "@virtuoso.dev/message-list";
import { init } from "emoji-mart";
import { v4 as uuidv4 } from "uuid";

import {
	buildChatMessageSentDescription,
	buildThreadVirtuosoList,
	channelPksEqual,
	normalizeChannelPk,
	posthogMessageChannel,
	resolveChannelByPk,
} from "./helpers";
import type {
	Channel,
	ChatMessage,
	ChatMessageAsset,
	ChatMessagesResponse,
	ThreadMessage,
	ThreadMessagesResponse,
	ThreadPreviewMessage,
	UnreadChannel,
	UnreadThread,
	WatchedThreads,
} from "./types";

init({ data });

const toUnreadChannel = (channel: Channel): UnreadChannel => ({
	pk: channel.pk,
	name: channel.name,
	channel_type: channel.channel_type,
	participants: channel.participants,
	ad: channel.ad
		? {
				ad_id: channel.ad.ad_id,
				ad_type: channel.ad.ad_type ?? "offered_to_rent",
			}
		: channel.ad_id != null && channel.ad_type
			? { ad_id: channel.ad_id, ad_type: channel.ad_type }
			: null,
});

export const ChatContext = React.createContext({
	activeChannel: null as Channel | null,
	activeThreadMessages: {
		results: [] as ThreadMessage[],
		next: null as string | null,
		previous: null as string | null,
		count: 0,
	},
	channelMessages: {
		results: [] as ChatMessage[],
		next: null as string | null,
		previous: null as string | null,
		count: 0,
	},
	clearAdChannel: noop,
	fetchWatchedThreads: noop,
	getIsChannelUnread: (_channel: Channel) => false as boolean | undefined,
	getIsThreadPreviewMessageUnread: (_thread: ThreadPreviewMessage) =>
		false as boolean | undefined,
	handleAddChatMessageReaction: noop,
	handleAddThreadMessageReaction: noop,
	handleCreateChannel: noop,
	handleSendChatMessage: noop,
	handleSendThreadMessage: noop,
	hasAnyUnreadMessages: false,
	hasAnyUnreadThreads: false,
	isAdChatInputDisabled: false,
	isConnectingToPusher: false,
	isLoadingInitialChannelMessages: true,
	isLoadingInitialThreadMessages: true,
	isLoadingInitialWatchedThreads: true,
	isLoadingNewerChannelMessages: true,
	isLoadingNewerThreadMessages: true,
	isLoadingNewerWatchedThreads: true,
	isLoadingPrivateChannels: false,
	isLoadingPublicChannels: true,
	isMobileSidebarOpen: false,
	isThreadPanelOpen: false as boolean,
	markChannelAsRead: noop,
	onChannelScroll: noop,
	onThreadScroll: noop,
	onWatchedThreadsScroll: noop,
	privateChannels: {
		results: [] as Channel[],
		next: null as string | null,
		previous: null as string | null,
		count: 0,
	},
	publicChannels: {
		results: [] as Channel[],
		next: null as string | null,
		previous: null as string | null,
		count: 0,
	},
	pusherStatus: "disconnected",
	isPusherConnected: false,
	isPusherDisconnected: false,
	isPusherReconnecting: false,
	shouldShowPusherConnectionBanner: false,
	retryPusherConnection: noop,
	scrollToVirtuosoBottom: noop,
	setActiveChannel: noop,
	setAdChannel: noop,
	setIsMobileSidebarOpen: noop,
	setThreadPreviewMessage: noop,
	threadPreviewMessage: null as ThreadPreviewMessage | ChatMessage | null,
	unreadChannels: [] as UnreadChannel[],
	unreadThreads: [] as UnreadThread[],
	virtuosoChannelRef: React.createRef<VirtuosoMessageListMethods>(),
	virtuosoThreadRef: React.createRef<VirtuosoMessageListMethods>(),
	virtuosoWatchedThreadsRef: React.createRef<VirtuosoMessageListMethods>(),
	watchedThreads: {
		results: [],
		next: null,
		previous: null,
		count: 0,
	} as WatchedThreads,
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();

	const isChatView = router.pathname === "/chat";
	const isWatchedThreadsView = router.pathname === "/threads";

	const {
		isLoggedIn,
		authenticatedUser,
		profilePicURL,
		authenticationChecked,
		canUseAuthenticatedApi: canUseAuthenticatedChat,
	} = useAuthenticatedUser();
	const { capturePosthogEvent } = usePosthog();
	const { trackEvent } = useLogs();
	const { reportError: reportChatError } = useErrorReport({
		functionNamePrefix: "useChat",
		defaultEvent: "Chat error",
		posthogProductEvent: "chat_error",
	});

	const [privateChannels, setPrivateChannels] = useState<{
		count: number;
		next: string | null;
		previous: string | null;
		results: Channel[];
	}>({
		results: [],
		next: null,
		previous: null,
		count: 0,
	});

	const [publicChannels, setPublicChannels] = useState<{
		count: number;
		next: string | null;
		previous: string | null;
		results: Channel[];
	}>({
		results: [],
		next: null,
		previous: null,
		count: 0,
	});

	const [isLoadingPrivateChannels, setIsLoadingPrivateChannels] =
		useState(true);
	const [isLoadingPublicChannels, setIsLoadingPublicChannels] = useState(true);
	// const [isLoadingWatchedThreads, setIsLoadingWatchedThreads] = useState(true);

	// messages for the current private channel in view
	const [channelMessages, setChannelMessages] = useState<ChatMessagesResponse>({
		results: [],
		next: null,
		previous: null,
		count: 0,
	});

	// messages for the current private channel in view
	const [activeThreadMessages, setActiveThreadMessages] =
		useState<ThreadMessagesResponse>({
			results: [],
			next: null,
			previous: null,
			count: 0,
		});

	const [watchedThreads, setWatchedThreads] = useState<WatchedThreads>({
		results: [],
		next: null,
		previous: null,
		count: 0,
	});

	const [isLoadingInitialChannelMessages, setIsLoadingInitialChannelMessages] =
		useState(true);
	const [isLoadingNewerChannelMessages, setIsLoadingNewerChannelMessages] =
		useState(false);

	const [isLoadingInitialThreadMessages, setIsLoadingInitialThreadMessages] =
		useState(true);
	const [isLoadingNewerThreadMessages, setIsLoadingNewerThreadMessages] =
		useState(false);

	const [isLoadingInitialWatchedThreads, setIsLoadingInitialWatchedThreads] =
		useState(true);
	const [isLoadingNewerWatchedThreads, setIsLoadingNewerWatchedThreads] =
		useState(false);

	// The currently active channel can be a private or public channel
	const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
	const [threadPreviewMessage, setThreadPreviewMessage] = useState<
		ChatMessage | ThreadPreviewMessage | null
	>(null);

	// Ad channel (when viewing an ad's discussion): overrides channelMessages / send when set
	const [adChannel, setAdChannelState] = useState<{
		adId: number;
		adType: AdType;
		status?: "archived" | "draft" | "submitted" | "approved";
	} | null>(null);
	const [adChannelMessages, setAdChannelMessages] =
		useState<ChatMessagesResponse>({
			results: [],
			next: null,
			previous: null,
			count: 0,
		});
	const [isLoadingAdChannelMessages, setIsLoadingAdChannelMessages] =
		useState(false);
	const adVirtuosoRef = useRef<any>(null);
	const adChannelFetchAbortRef = useRef<AbortController | null>(null);
	const adChannelFetchGenerationRef = useRef(0);
	const adChannelFetchDiagnosticsRef = useRef({
		authenticationChecked,
		userEmail: authenticatedUser?.email ?? null,
		hadJwt: Boolean(authenticatedUser?.token),
	});

	const reportChatErrorRef = useRef(reportChatError);

	useEffect(() => {
		reportChatErrorRef.current = reportChatError;
	}, [reportChatError]);

	useEffect(() => {
		adChannelFetchDiagnosticsRef.current = {
			authenticationChecked,
			userEmail: authenticatedUser?.email ?? null,
			hadJwt: Boolean(authenticatedUser?.token),
		};
	}, [
		authenticationChecked,
		authenticatedUser?.email,
		authenticatedUser?.token,
	]);

	const cancelAdChannelFetch = useCallback(() => {
		adChannelFetchAbortRef.current?.abort();
		adChannelFetchAbortRef.current = null;
		adChannelFetchGenerationRef.current += 1;
	}, []);

	const setAdChannel = useCallback(
		(
			adId: number,
			adType: AdType,
			status?: "archived" | "draft" | "submitted" | "approved",
		) => {
			try {
				setAdChannelState({ adId, adType, status });
				setAdChannelMessages({
					results: [],
					next: null,
					previous: null,
					count: 0,
				});
			} catch (error) {
				reportChatError(error, "setAdChannel");
			}
		},
		[reportChatError],
	);
	const clearAdChannel = useCallback(() => {
		try {
			cancelAdChannelFetch();
			setAdChannelState(null);
		} catch (error) {
			reportChatError(error, "clearAdChannel");
		}
	}, [cancelAdChannelFetch, reportChatError]);

	const refetchAdChannelMessages = useCallback(async () => {
		if (!adChannel?.adId || !adChannel?.adType) {
			return;
		}

		cancelAdChannelFetch();
		const controller = new AbortController();
		adChannelFetchAbortRef.current = controller;
		const generation = adChannelFetchGenerationRef.current;

		setIsLoadingAdChannelMessages(true);
		try {
			const { data } = await instanceAxios({
				method: "get",
				url: `/chat/fetch-ad-channel-messages/${adChannel.adType}/${adChannel.adId}`,
				signal: controller.signal,
				timeout: 25_000,
			});
			if (generation !== adChannelFetchGenerationRef.current) {
				return;
			}
			const rawResults = data?.results ?? [];
			const oldestFirst = [...rawResults].reverse();
			setAdChannelMessages({
				results: oldestFirst,
				next: data?.next ?? null,
				previous: data?.previous ?? null,
				count: data?.count ?? oldestFirst.length,
			});
			adVirtuosoRef.current?.data?.replace(oldestFirst);
		} catch (error) {
			if (generation !== adChannelFetchGenerationRef.current) {
				return;
			}
			const transport = buildAxiosTransportDiagnostics(error);
			const diagnostics = adChannelFetchDiagnosticsRef.current;
			reportChatErrorRef.current(error, "fetchAdChannelMessages", {
				properties: {
					ad_id: adChannel.adId,
					ad_type: adChannel.adType,
					ad_status: adChannel.status ?? null,
					user_email: diagnostics.userEmail,
					...transport,
					navigator_on_line:
						typeof navigator !== "undefined" ? navigator.onLine : null,
					document_visibility:
						typeof document !== "undefined" ? document.visibilityState : null,
					authentication_checked: diagnostics.authenticationChecked,
					had_jwt: diagnostics.hadJwt,
				},
			});
		} finally {
			if (generation === adChannelFetchGenerationRef.current) {
				setIsLoadingAdChannelMessages(false);
			}
		}
	}, [adChannel?.adId, adChannel?.adType, cancelAdChannelFetch]);

	useEffect(() => {
		void refetchAdChannelMessages();
	}, [refetchAdChannelMessages]);

	const subscribeToPusherRef = useRef<() => void>(() => {});
	const activeChannelPkRef = useRef<number | null>(null);
	const isChatViewRef = useRef(isChatView);

	useEffect(() => {
		activeChannelPkRef.current = normalizeChannelPk(activeChannel?.pk);
		isChatViewRef.current = isChatView;
	}, [activeChannel?.pk, isChatView]);

	// Virtuoso refs for private channel messages
	const virtuosoChannelRef = useRef<any>(null);
	const virtuosoChannelFirstMessageIdRef = useRef<number | null>(null);

	// Virtuoso refs for thread
	const virtuosoThreadRef = useRef<any>(null);
	const virtuosoThreadFirstMessageIdRef = useRef<number | null>(null);
	const threadFetchIdRef = useRef(0);

	// Virtuoso refs for watched threads
	const virtuosoWatchedThreadsRef = useRef<any>(null);
	const virtuosoWatchedThreadsFirstMessageIdRef = useRef<number | null>(null);

	// When user closes thread panel, URL is updated async; this ref prevents the effect from reopening before URL updates
	const threadPanelJustClosedRef = useRef(false);

	// Save scroll position before thread panel open/close so we can restore after layout settles
	const channelScrollBeforeThreadOpenRef = useRef<{
		location: ListScrollLocation;
		count: number;
		useAdRef: boolean;
		scrollToIndex?: number;
	} | null>(null);

	const onChannelScroll = useCallback(
		async (location: ListScrollLocation) => {
			let loadingMore = false;
			try {
				// offset is at the top
				if (
					location.listOffset > -100 &&
					!isLoadingNewerChannelMessages &&
					virtuosoChannelFirstMessageIdRef.current &&
					channelMessages.next
				) {
					loadingMore = true;
					setIsLoadingNewerChannelMessages(true);

					const { data } = await instanceAxios({
						method: "get",
						url: channelMessages.next,
					});
					// Older messages page: order oldest-first so prepend keeps list oldest→newest (newest at bottom)
					const oldestFirst = [...data.results].reverse();

					virtuosoChannelFirstMessageIdRef.current = oldestFirst[0].pk;

					virtuosoChannelRef.current?.data.prepend(oldestFirst, "smooth");

					setChannelMessages((prevMessages) => ({
						...prevMessages,
						results: [...oldestFirst, ...prevMessages.results],
						next: data.next,
						previous: data.previous,
					}));
				}
			} catch (error) {
				reportChatError(error, "onChannelScroll");
			} finally {
				if (loadingMore) {
					setIsLoadingNewerChannelMessages(false);
				}
			}
		},
		[channelMessages.next, isLoadingNewerChannelMessages, reportChatError],
	);

	const onThreadScroll = useCallback(
		async (location: ListScrollLocation) => {
			let loadingMore = false;
			try {
				// offset is at the top
				if (
					location.listOffset > -100 &&
					!isLoadingNewerThreadMessages &&
					virtuosoThreadFirstMessageIdRef.current &&
					activeThreadMessages.next
				) {
					loadingMore = true;
					setIsLoadingNewerThreadMessages(true);

					const { data } = await instanceAxios({
						method: "get",
						url: activeThreadMessages.next,
					});
					// Older messages page: order oldest-first so prepend keeps list oldest→newest (newest at bottom)
					const oldestFirst = [...data.results].reverse();

					virtuosoThreadFirstMessageIdRef.current = oldestFirst[0].pk;

					setActiveThreadMessages((prevMessages) => {
						const newResults = [...oldestFirst, ...prevMessages.results];
						if (threadPreviewMessage) {
							virtuosoThreadRef.current?.data?.replace(
								buildThreadVirtuosoList(threadPreviewMessage, newResults),
							);
						}
						return {
							...prevMessages,
							results: newResults,
							next: data.next,
							previous: data.previous,
						};
					});
				}
			} catch (error) {
				reportChatError(error, "onThreadScroll");
			} finally {
				if (loadingMore) {
					setIsLoadingNewerThreadMessages(false);
				}
			}
		},
		[
			activeThreadMessages.next,
			isLoadingNewerThreadMessages,
			reportChatError,
			threadPreviewMessage,
		],
	);

	const onWatchedThreadsScroll = useCallback(
		async (location: ListScrollLocation) => {
			let loadingMore = false;
			try {
				if (
					location.isAtBottom &&
					!isLoadingNewerWatchedThreads &&
					virtuosoWatchedThreadsFirstMessageIdRef.current &&
					watchedThreads.next
				) {
					loadingMore = true;
					setIsLoadingNewerWatchedThreads(true);

					const { data } = await instanceAxios({
						method: "get",
						url: watchedThreads.next,
					});

					virtuosoWatchedThreadsFirstMessageIdRef.current = data.results[0].pk;

					virtuosoWatchedThreadsRef.current?.data.append(
						data.results,
						"smooth",
					);

					setWatchedThreads((prevMessages) => ({
						...prevMessages,
						results: [...prevMessages.results, ...data.results],
						next: data.next,
						previous: data.previous,
					}));
				}
			} catch (error) {
				reportChatError(error, "onWatchedThreadsScroll");
			} finally {
				if (loadingMore) {
					setIsLoadingNewerWatchedThreads(false);
				}
			}
		},
		[isLoadingNewerWatchedThreads, watchedThreads, reportChatError],
	);

	const fetchInitialMessagesForChannel = useCallback(
		async (activeChan: Channel) => {
			setIsLoadingInitialChannelMessages(true);
			try {
				const { data } = await instanceAxios({
					method: "get",
					url: `/chat/fetch-chat-messages/${activeChan?.pk}`,
				});
				// Oldest first so newest messages appear at the bottom; copy before reverse to avoid mutating API response
				const oldestFirst = [...data.results].reverse();

				setChannelMessages((prevMessages) => ({
					...prevMessages,
					results: oldestFirst,
					next: data.next,
					previous: data.previous,
				}));

				virtuosoChannelFirstMessageIdRef.current = oldestFirst[0]?.pk ?? null;

				virtuosoChannelRef.current?.data?.replace(oldestFirst);
				setIsLoadingInitialChannelMessages(false);
			} catch (error) {
				reportChatError(error, "fetchInitialMessagesForChannel");
			}
		},
		[reportChatError],
	);

	const fetchInitialMessagesForThread = useCallback(
		async (parentChatMessage: ChatMessage | ThreadPreviewMessage) => {
			if (!parentChatMessage?.pk) return;
			const fetchId = ++threadFetchIdRef.current;
			setIsLoadingInitialThreadMessages(true);
			try {
				const { data } = await instanceAxios({
					method: "get",
					url: `/chat/fetch-thread-messages/${parentChatMessage.pk}`,
				});
				if (fetchId !== threadFetchIdRef.current) return;

				const rawResults = data?.results ?? [];
				const oldestFirst =
					rawResults.length > 0 ? [...rawResults].reverse() : [];

				setActiveThreadMessages((prevMessages) => ({
					...prevMessages,
					results: oldestFirst,
					next: data?.next ?? null,
					previous: data?.previous ?? null,
					count: data?.count ?? oldestFirst.length,
				}));

				virtuosoThreadFirstMessageIdRef.current = oldestFirst[0]?.pk ?? null;

				virtuosoThreadRef.current?.data?.replace(
					buildThreadVirtuosoList(parentChatMessage, oldestFirst),
				);
			} catch (error) {
				if (fetchId === threadFetchIdRef.current) {
					reportChatError(error, "fetchInitialMessagesForThread");
				}
			} finally {
				if (fetchId === threadFetchIdRef.current) {
					setIsLoadingInitialThreadMessages(false);
				}
			}
		},
		[reportChatError],
	);

	useEffect(() => {
		const fetchPrivateChannels = async () => {
			if (!canUseAuthenticatedChat) {
				return;
			}

			try {
				const { data } = await instanceAxios({
					method: "get",
					url: `/chat/fetch-private-channels`,
				});
				setPrivateChannels(data);
				setIsLoadingPrivateChannels(false);

				if (data.results.length > 0) {
					const channelPkParam = router.query.channel;
					if (isChatView) {
						if (channelPkParam != null) {
							const pk =
								typeof channelPkParam === "string"
									? Number(channelPkParam)
									: Number(channelPkParam[0]);
							const channel = !Number.isNaN(pk)
								? data.results.find((c: Channel) => c.pk === pk)
								: undefined;
							if (channel) {
								setActiveChannel(channel);
								return fetchInitialMessagesForChannel(channel);
							}
						}
						return;
					}
					setActiveChannel(data.results[0]);
					return fetchInitialMessagesForChannel(data.results[0]);
				}
			} catch (error) {
				reportChatError(error, "fetchPrivateChannels");
			} finally {
				setIsLoadingPrivateChannels(false);
			}
		};

		if (canUseAuthenticatedChat) {
			void fetchPrivateChannels();
		} else if (authenticationChecked) {
			setIsLoadingPrivateChannels(false);
		}
	}, [
		authenticationChecked,
		canUseAuthenticatedChat,
		fetchInitialMessagesForChannel,
		isChatView,
		router.query.channel,
		reportChatError,
	]);

	useEffect(() => {
		const fetchPublicChannels = async () => {
			if (!canUseAuthenticatedChat) {
				return;
			}

			try {
				const { data } = await instanceAxios({
					method: "get",
					url: `/chat/fetch-public-channels`,
				});
				setPublicChannels(data);
				setIsLoadingPublicChannels(false);

				if (data.results.length > 0) {
					const channelPkParam = router.query.channel;
					if (isChatView) {
						if (channelPkParam != null) {
							const pk =
								typeof channelPkParam === "string"
									? Number(channelPkParam)
									: Number(channelPkParam[0]);
							const channel = !Number.isNaN(pk)
								? data.results.find((c: Channel) => c.pk === pk)
								: undefined;
							if (channel) {
								setActiveChannel(channel);
								return fetchInitialMessagesForChannel(channel);
							}
						}
						return;
					}
					setActiveChannel(data.results[0]);
					return fetchInitialMessagesForChannel(data.results[0]);
				}
			} catch (error) {
				reportChatError(error, "fetchPublicChannels");
			} finally {
				setIsLoadingPublicChannels(false);
			}
		};

		if (canUseAuthenticatedChat) {
			void fetchPublicChannels();
		} else if (authenticationChecked) {
			setIsLoadingPublicChannels(false);
		}
	}, [
		authenticationChecked,
		canUseAuthenticatedChat,
		fetchInitialMessagesForChannel,
		isChatView,
		router.query.channel,
		reportChatError,
	]);

	const refreshIntervalInSeconds = 2; // 2 seconds
	/** Only poll when auth context has a non-expired JWT (`canUseAuthenticatedChat`). */
	const unreadChannelsUrl = canUseAuthenticatedChat
		? `/chat/unread-channels`
		: null;

	const { data: unreadChannels, mutate: mutateUnreadChannels } = useSWR<
		UnreadChannel[]
	>(unreadChannelsUrl, fetcher, {
		refreshInterval: unreadChannelsUrl ? refreshIntervalInSeconds * 1000 : 0,
		keepPreviousData: true,
		shouldRetryOnError: false,
	});

	const unreadThreadsUrl = canUseAuthenticatedChat
		? `/chat/unread-threads`
		: null;
	const { data: unreadThreadsRaw, mutate: mutateUnreadThreads } = useSWR<
		UnreadThread[] | { results?: UnreadThread[] }
	>(unreadThreadsUrl, fetcher, {
		refreshInterval: unreadThreadsUrl ? refreshIntervalInSeconds * 1000 : 0,
		keepPreviousData: true,
		shouldRetryOnError: false,
	});

	const unreadThreads = useMemo(() => {
		try {
			if (!unreadThreadsRaw) return [];
			return Array.isArray(unreadThreadsRaw)
				? unreadThreadsRaw
				: (unreadThreadsRaw?.results ?? []);
		} catch (error) {
			reportChatError(error, "unreadThreads");
			return [];
		}
	}, [unreadThreadsRaw, reportChatError]);

	const hasAnyUnreadThreads = useMemo(() => {
		try {
			return unreadThreads.length > 0;
		} catch (error) {
			reportChatError(error, "hasAnyUnreadThreads");
			return false;
		}
	}, [unreadThreads, reportChatError]);

	/** Pusher-driven unread; not cleared when /chat/unread-channels polls []. */
	const [localUnreadChannelPks, setLocalUnreadChannelPks] = useState<number[]>(
		[],
	);

	const findChannelByPk = useCallback(
		(pk: number) =>
			[...privateChannels.results, ...publicChannels.results].find((c) =>
				channelPksEqual(c.pk, pk),
			),
		[privateChannels.results, publicChannels.results],
	);

	const addLocalUnreadChannel = useCallback((channelPk: number | string) => {
		const pk = normalizeChannelPk(channelPk);
		if (pk == null) {
			return;
		}
		setLocalUnreadChannelPks((prev) =>
			prev.includes(pk) ? prev : [...prev, pk],
		);
	}, []);

	const removeLocalUnreadChannel = useCallback((channelPk: number | string) => {
		const pk = normalizeChannelPk(channelPk);
		if (pk == null) {
			return;
		}
		setLocalUnreadChannelPks((prev) => prev.filter((id) => id !== pk));
	}, []);

	const effectiveUnreadChannels = useMemo(() => {
		try {
			const merged = new Map<number, UnreadChannel>();

			for (const channel of unreadChannels ?? []) {
				const pk = normalizeChannelPk(channel.pk);
				if (pk != null) {
					merged.set(pk, channel);
				}
			}

			for (const pk of localUnreadChannelPks) {
				if (merged.has(pk)) {
					continue;
				}
				const channel = findChannelByPk(pk);
				if (channel) {
					merged.set(pk, toUnreadChannel(channel));
				}
			}

			return Array.from(merged.values());
		} catch (error) {
			reportChatError(error, "effectiveUnreadChannels");
			return [];
		}
	}, [unreadChannels, localUnreadChannelPks, findChannelByPk, reportChatError]);

	const unreadChannelsExcludingActive = useMemo(() => {
		try {
			return effectiveUnreadChannels.filter((channel) => {
				if (isChatView && channelPksEqual(channel.pk, activeChannel?.pk)) {
					return false;
				}
				return true;
			});
		} catch (error) {
			reportChatError(error, "unreadChannelsExcludingActive");
			return [];
		}
	}, [effectiveUnreadChannels, isChatView, activeChannel?.pk, reportChatError]);

	const hasAnyUnreadMessages = unreadChannelsExcludingActive.length > 0;

	const markChannelAsRead = useCallback(
		async (channelPk: number | string) => {
			if (!canUseAuthenticatedChat) {
				return;
			}

			const pk = normalizeChannelPk(channelPk);
			if (pk == null) {
				return;
			}

			removeLocalUnreadChannel(pk);

			void mutateUnreadChannels(
				(current) =>
					current?.filter((channel) => !channelPksEqual(channel.pk, pk)) ?? [],
				{ revalidate: false },
			);

			try {
				await instanceAxios({
					method: "post",
					url: `/chat/mark-channel-as-read/${pk}`,
				});
			} catch (error) {
				reportChatError(error, "markChannelAsRead");
			}
		},
		[
			canUseAuthenticatedChat,
			mutateUnreadChannels,
			removeLocalUnreadChannel,
			reportChatError,
		],
	);

	const markChannelAsUnread = addLocalUnreadChannel;

	const markThreadAsRead = useCallback(
		async (parentChatMessagePk: number) => {
			if (!canUseAuthenticatedChat) {
				return;
			}
			try {
				await instanceAxios({
					method: "post",
					url: `/chat/mark-thread-as-read/${parentChatMessagePk}`,
				});
				await mutateUnreadThreads();
			} catch (error) {
				reportChatError(error, "markThreadAsRead");
			}
		},
		[canUseAuthenticatedChat, mutateUnreadThreads, reportChatError],
	);

	const fetchWatchedThreads = useCallback(async () => {
		if (!canUseAuthenticatedChat) {
			setIsLoadingInitialWatchedThreads(false);
			return;
		}

		setIsLoadingInitialWatchedThreads(true);

		try {
			const { data } = await instanceAxios({ url: `/chat/watched-threads` });

			setWatchedThreads(data);

			virtuosoWatchedThreadsFirstMessageIdRef.current =
				data?.results?.[0]?.pk || null;

			virtuosoWatchedThreadsRef.current?.data?.replace(data.results);
		} catch (error) {
			reportChatError(error, "fetchWatchedThreads");
		} finally {
			setIsLoadingInitialWatchedThreads(false);
		}
	}, [canUseAuthenticatedChat, reportChatError]);

	const syncAfterPusherReconnect = useCallback(async () => {
		try {
			subscribeToPusherRef.current?.();
			await Promise.all([mutateUnreadChannels(), mutateUnreadThreads()]);

			if (adChannel) {
				await refetchAdChannelMessages();
			} else if (activeChannel) {
				await fetchInitialMessagesForChannel(activeChannel);
			}

			if (threadPreviewMessage) {
				await fetchInitialMessagesForThread(threadPreviewMessage);
			}

			if (isWatchedThreadsView) {
				await fetchWatchedThreads();
			}
		} catch (error) {
			reportChatError(error, "syncAfterPusherReconnect");
		}
	}, [
		activeChannel,
		adChannel,
		fetchInitialMessagesForChannel,
		fetchInitialMessagesForThread,
		fetchWatchedThreads,
		isWatchedThreadsView,
		mutateUnreadChannels,
		mutateUnreadThreads,
		refetchAdChannelMessages,
		reportChatError,
		threadPreviewMessage,
	]);

	const {
		isConnectingToPusher,
		isPusherConnected,
		isPusherDisconnected,
		isPusherReconnecting,
		pusherStatus,
		retryConnection: retryPusherConnection,
		shouldShowConnectionBanner: shouldShowPusherConnectionBanner,
	} = usePusherConnection({
		onReconnected: () => {
			void syncAfterPusherReconnect();
		},
	});

	// When on /chat: sync activeChannel from URL, or set first channel when no channel in URL (only after router is ready to avoid flash)
	useEffect(() => {
		if (!isChatView || !router.isReady) return;

		const syncActiveChannelFromUrl = async () => {
			try {
				const allChannels = [
					...privateChannels.results,
					...publicChannels.results,
				];
				if (allChannels.length === 0) return;

				const channelPkParam = router.query.channel;
				if (channelPkParam != null) {
					const pk =
						typeof channelPkParam === "string"
							? Number(channelPkParam)
							: Number(channelPkParam[0]);
					if (Number.isNaN(pk)) return;
					const channel = allChannels.find((c: Channel) => c.pk === pk);
					if (channel && channel.pk !== activeChannel?.pk) {
						setActiveChannel(channel);
						await fetchInitialMessagesForChannel(channel);
					}
					return;
				}
				// No channel in URL: set first channel so /chat without param works
				if (activeChannel == null) {
					setActiveChannel(allChannels[0]);
					await fetchInitialMessagesForChannel(allChannels[0]);
				}
			} catch (error) {
				reportChatError(error, "syncActiveChannelFromUrl");
			}
		};

		void syncActiveChannelFromUrl();
	}, [
		router.isReady,
		router.query.channel,
		isChatView,
		activeChannel?.pk,
		activeChannel == null,
		privateChannels.results,
		publicChannels.results,
		fetchInitialMessagesForChannel,
		reportChatError,
	]);

	const scrollToVirtuosoBottom = useCallback(() => {
		try {
			virtuosoChannelRef?.current?.scrollToItem({
				index: "LAST",
				align: "end",
				behavior: "smooth",
			});
		} catch (error) {
			reportChatError(error, "scrollToVirtuosoBottom");
		}
	}, [reportChatError]);

	useEffect(() => {
		const handleNewMessage = ({ data }: { data: any }) => {
			try {
				// ad channel: message triggered by sender via api/pusher; we subscribe when viewing this ad
				if (
					adChannel &&
					data?.metadata?.message_type === "ad_channel_message" &&
					data.metadata.ad_id === adChannel.adId &&
					data.metadata.ad_type === adChannel.adType
				) {
					const isFromSelf =
						data.metadata?.sender?.pk === authenticatedUser?.pk;
					if (!isFromSelf) {
						const newMessage: ChatMessage = {
							pk: data.metadata?.pk,
							timestamp: data.metadata.timestamp,
							sender: data.metadata?.sender,
							content: data.text,
							reaction_set: data.metadata?.reaction_set ?? [],
							num_replies: data.metadata?.num_replies ?? 0,
							chatmessageasset_set: data.metadata?.chatmessageasset_set ?? [],
						};
						setAdChannelMessages((prev) => ({
							...prev,
							results: [...prev.results, newMessage],
							count: prev.count + 1,
						}));
						adVirtuosoRef.current?.data?.append([newMessage], () => ({
							index: "LAST",
							align: "end",
							behavior: "smooth",
						}));
					}
				}

				// ad channel: thread reply so other viewers see reply count update (and thread if open)
				if (
					adChannel &&
					data?.metadata?.message_type === "thread_message" &&
					data.metadata.ad_id === adChannel.adId &&
					data.metadata.ad_type === adChannel.adType
				) {
					const parentPk = data.metadata?.parent_chat_message_pk;
					const isFromSelf =
						data.metadata?.sender?.pk === authenticatedUser?.pk;
					if (!isFromSelf) {
						const isThreadPanelOpenForThis =
							threadPreviewMessage?.pk === parentPk;
						setAdChannelMessages((prev) => {
							const newResults = prev.results.map((msg) =>
								msg.pk === parentPk
									? {
											...msg,
											num_replies: (msg.num_replies || 0) + 1,
											has_unread_replies: isThreadPanelOpenForThis
												? msg.has_unread_replies
												: true,
										}
									: msg,
							);
							adVirtuosoRef.current?.data?.replace(newResults);
							return { ...prev, results: newResults };
						});
					}
					if (threadPreviewMessage?.pk === parentPk && !isFromSelf) {
						setThreadPreviewMessage((prev) =>
							prev && prev.pk === parentPk
								? ({
										...prev,
										num_replies: (prev.num_replies ?? 0) + 1,
									} as ThreadPreviewMessage)
								: prev,
						);
						const newThreadMessage: ThreadMessage = {
							pk: data.metadata?.pk,
							timestamp: data.metadata.timestamp,
							sender: data.metadata?.sender,
							content: data.text,
							reaction_set: [],
							threadmessageasset_set:
								data.metadata?.threadmessageasset_set ?? [],
						};
						setActiveThreadMessages((prev) => ({
							...prev,
							results: [...prev.results, newThreadMessage],
						}));
						virtuosoThreadRef?.current?.data?.append(
							[newThreadMessage],
							() => ({
								index: "LAST",
								align: "end",
								behavior: "smooth",
							}),
						);
					}
				}

				if (data?.metadata?.message_type === "chat_message") {
					const messageChannelPk = normalizeChannelPk(data.metadata.channel_pk);
					const isViewingChannel =
						isChatViewRef.current &&
						messageChannelPk != null &&
						messageChannelPk === activeChannelPkRef.current;
					const isFromSelf =
						data.metadata?.sender?.pk === authenticatedUser?.pk;

					if (isViewingChannel) {
						if (!isFromSelf) {
							const newMessage: ChatMessage = {
								pk: data.metadata?.pk,
								timestamp: data.metadata.timestamp,
								sender: data.metadata?.sender,
								content: data.text,
								reaction_set: [],
								num_replies: 0,
								chatmessageasset_set: data.metadata?.chatmessageasset_set || [],
							};

							setChannelMessages((prevMessages) => ({
								...prevMessages,
								results: [...prevMessages.results, newMessage],
							}));

							virtuosoChannelRef?.current?.data?.append([newMessage], () => ({
								index: "LAST",
								align: "end",
								behavior: "smooth",
							}));
						}

						void markChannelAsRead(messageChannelPk);
					} else if (!isFromSelf && messageChannelPk != null) {
						markChannelAsUnread(messageChannelPk);
					}
				}

				if (data.metadata?.message_type === "thread_message") {
					// Only handle channel thread messages here; ad thread messages are handled in the ad block above
					const isChannelThreadMessage = data.metadata?.channel_pk != null;
					const isOpenThreadForThisMessage =
						isChannelThreadMessage &&
						threadPreviewMessage?.pk ===
							data.metadata?.parent_chat_message_pk &&
						threadPreviewMessage?.channel?.pk === data.metadata?.channel_pk;
					const isFromSelf =
						data.metadata?.sender?.pk === authenticatedUser?.pk;
					if (isOpenThreadForThisMessage && !isFromSelf) {
						setThreadPreviewMessage(
							(prev) =>
								({
									...prev,
									num_replies: (prev?.num_replies || 0) + 1,
								}) as ThreadPreviewMessage,
						);

						const newMessage: ThreadMessage = {
							pk: data.metadata?.pk,
							timestamp: data.metadata.timestamp,
							sender: data.metadata?.sender,
							content: data.text,
							reaction_set: [],
							threadmessageasset_set:
								data.metadata?.threadmessageasset_set || [],
						};

						setActiveThreadMessages((prevMessages) => ({
							...prevMessages,
							results: [newMessage, ...prevMessages.results],
						}));

						virtuosoThreadRef?.current?.data?.append([newMessage], () => ({
							index: "LAST",
							align: "end",
							behavior: "smooth",
						}));
					}
					if (
						isChannelThreadMessage &&
						isChatViewRef.current &&
						channelPksEqual(
							data.metadata?.channel_pk,
							activeChannelPkRef.current,
						) &&
						!isFromSelf
					) {
						const parentPkChannel = data.metadata?.parent_chat_message_pk;
						const isThreadPanelOpenForThis =
							threadPreviewMessage?.pk === parentPkChannel &&
							threadPreviewMessage?.channel?.pk === data.metadata?.channel_pk;
						// update chat message list with new reply count and show unread dot if thread panel not open for this message
						setChannelMessages((prevMessages) => {
							const newChatMessages = prevMessages.results.map((msg) =>
								msg.pk === parentPkChannel
									? {
											...msg,
											num_replies: (msg.num_replies || 0) + 1,
											has_unread_replies: isThreadPanelOpenForThis
												? msg.has_unread_replies
												: true,
										}
									: msg,
							);
							virtuosoChannelRef?.current?.data?.replace(newChatMessages);
							return { ...prevMessages, results: newChatMessages };
						});
					}

					if (isChannelThreadMessage && isWatchedThreadsView && !isFromSelf) {
						setWatchedThreads((prevThreads) => {
							const newWatchedThreads = prevThreads.results.map((thread) =>
								thread.pk === data.metadata?.parent_chat_message_pk
									? { ...thread, num_replies: (thread.num_replies || 0) + 1 }
									: thread,
							);
							virtuosoWatchedThreadsRef?.current?.data?.replace(
								newWatchedThreads,
							);
							return { ...prevThreads, results: newWatchedThreads };
						});
					}
				}
			} catch (error) {
				reportChatError(error, "handleNewMessage");
			}
		};

		const bindChannel = (channelName: string) => {
			if (!pusher) {
				return;
			}
			try {
				const subscription = pusher.subscribe(channelName);
				subscription.unbind("new-message");
				subscription.bind("new-message", (data: any) =>
					handleNewMessage({ data }),
				);
			} catch (error) {
				reportChatError(error, `subscribeToChannels_bind:${channelName}`);
			}
		};

		const subscribeToChannels = () => {
			try {
				const allUsersChannels = [
					...privateChannels.results,
					...publicChannels.results,
				];

				allUsersChannels.forEach((channel) => {
					bindChannel(String(channel.pk));
				});

				const adPusherChannelName =
					adChannel && `ad-${adChannel.adType}-${adChannel.adId}`;
				if (adPusherChannelName) {
					bindChannel(adPusherChannelName);
				}
			} catch (error) {
				reportChatError(error, "subscribeToChannels");
			}
		};

		subscribeToPusherRef.current = subscribeToChannels;

		if (
			!isLoadingPrivateChannels &&
			!isLoadingPublicChannels &&
			canUseAuthenticatedChat &&
			isPusherConnected
		) {
			subscribeToChannels();
		}

		const adPusherChannelName =
			adChannel && `ad-${adChannel.adType}-${adChannel.adId}`;

		return () => {
			try {
				if (activeChannel?.pk) {
					pusher?.unsubscribe(String(activeChannel.pk));
				}
				if (adPusherChannelName) {
					pusher?.unsubscribe(adPusherChannelName);
				}
			} catch (error) {
				reportChatError(error, "pusherUnsubscribe");
			}
		};
	}, [
		activeChannel,
		activeChannel?.pk,
		adChannel,
		authenticatedUser?.pk,
		reportChatError,
		channelMessages,
		channelMessages.results,
		isChatView,
		isLoadingPrivateChannels,
		isLoadingPublicChannels,
		canUseAuthenticatedChat,
		isPusherConnected,
		markChannelAsUnread,
		markChannelAsRead,
		isWatchedThreadsView,
		privateChannels.results,
		publicChannels.results,
		threadPreviewMessage,
		watchedThreads,
	]);

	const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
		useState<boolean>(false);

	const toggleMobileSidebar = (isOpen: boolean) => {
		try {
			setIsMobileSidebarOpen(isOpen);
			setThreadPreviewMessage(null);
		} catch (error) {
			reportChatError(error, "toggleMobileSidebar");
		}
	};

	const handleCreateChannel = async ({
		channelName,
		channelType,
		participantPks,
		channelMembers,
	}: {
		channelMembers: User[];
		channelName: string;
		channelType: string;
		participantPks: string[];
	}) => {
		try {
			const { data } = await instanceAxios({
				method: "post",
				url: `/chat/create-channel`,
				data: {
					name: channelName,
					participants: participantPks,
					channel_type: channelType,
				},
			});

			if (channelType === "direct_message") {
				const newChannel = {
					...data,
					participants: channelMembers,
				};

				setPrivateChannels((prev) => ({
					...prev,
					count: prev.count + 1,
					results: [newChannel, ...prev.results],
				}));

				participantPks
					.filter((pk) => Number(pk) !== authenticatedUser?.pk)
					.forEach(async (pk) => {
						try {
							await axios.post("/api/pusher/new-private-channel", {
								channel: `new-private-channel-${pk}`,
								data: {
									...data,
									participants: channelMembers,
								},
							});
						} catch (error) {
							reportChatError(error, "handleCreateChannel_notifyParticipant");
						}
					});

				setActiveChannel(newChannel);
				fetchInitialMessagesForChannel(newChannel);

				// Ensure the chat view loads the correct DM via `router.query.channel`.
				router.push({ pathname: "/chat", query: { channel: newChannel.pk } });
			}

			return data;
		} catch (error: any) {
			reportChatError(error, "handleCreateChannel");
			if (
				error?.response?.data.includes(
					"A channel with these users already exists",
				)
			) {
				const existingChannelPK = error?.response?.data
					.split("pk:")
					.pop()
					?.trim();

				const existingChannel = privateChannels.results.find(
					(channel) => channel.pk === parseInt(existingChannelPK, 10),
				);
				setActiveChannel(existingChannel || null);
				router.push({
					pathname: "/chat",
					query: { channel: existingChannel?.pk ?? existingChannelPK },
				});
				return existingChannel ?? { pk: parseInt(existingChannelPK, 10) };
			}

			throw new Error(error);
		}
	};

	const handleSendChatMessage = async ({
		content,
		channelPk,
		chatMessageAssets,
	}: {
		channelPk: ChatMessage["pk"];
		chatMessageAssets: ChatMessageAsset[];
		content: string;
	}) => {
		if (!canUseAuthenticatedChat) {
			return;
		}

		try {
			const { data } = await instanceAxios({
				method: "post",
				url: `/chat/send-chat-message`,
				data: {
					content,
					channel: channelPk,
					chatmessageasset_set: chatMessageAssets,
				},
			});

			const newMessage: ChatMessage = {
				pk: data?.pk,
				timestamp: data?.timestamp ?? new Date().toISOString(),
				sender: data?.sender ?? {
					pk: authenticatedUser?.pk ?? 0,
					username: authenticatedUser?.username ?? "",
					first_name: authenticatedUser?.firstName ?? "",
					last_name: authenticatedUser?.lastName ?? "",
					email: "",
					human_profile: {
						pk: 0,
						profile_image_url: profilePicURL ?? "",
						bio: "",
						facebook_url: "",
						instagram_url: "",
						linked_in_url: "",
						personal_website_url: "",
					},
				},
				content: data?.content ?? content,
				reaction_set: data?.reaction_set ?? [],
				num_replies: data?.num_replies ?? 0,
				chatmessageasset_set:
					data?.chatmessageasset_set ??
					chatMessageAssets.map((a, i) => ({
						asset_url: a.asset_url,
						asset_type: a.asset_type,
						pk: i + 1,
					})),
			};

			setChannelMessages((prev) => ({
				...prev,
				results: [...prev.results, newMessage],
			}));
			virtuosoChannelRef?.current?.data?.append([newMessage], () => ({
				index: "LAST",
				align: "end",
				behavior: "smooth",
			}));

			await axios.post("/api/pusher", {
				channel: channelPk,
				event: "new-message",
				data: {
					text: content,
					metadata: {
						message_type: "chat_message",
						channel_pk: channelPk,
						pk: data.pk,
						timestamp: new Date().toISOString(),
						chatmessageasset_set: chatMessageAssets,
						// Include pk so handleNewMessage can skip echo for the sender (same pattern as ad channel messages)
						sender: newMessage.sender,
					},
				},
			});

			const channelForTracking = resolveChannelByPk(
				channelPk,
				activeChannel,
				privateChannels.results,
				publicChannels.results,
			);

			trackEvent({
				channel: "chat-message",
				event: "Chat message sent",
				description: buildChatMessageSentDescription({
					channelPk,
					channel: channelForTracking,
					senderEmail: authenticatedUser?.email,
					senderPk: authenticatedUser?.pk,
				}),
				functionName: "useChat > handleSendChatMessage",
			});
			capturePosthogEvent("chat_message_sent", {
				channel: posthogMessageChannel(
					activeChannel?.pk === channelPk ? activeChannel : null,
				),
				type: "original",
			});
		} catch (error) {
			reportChatError(error, "handleSendChatMessage");
			throw error;
		}
	};

	const handleSendAdChannelMessage = useCallback(
		async ({
			content,
			chatMessageAssets,
		}: {
			content: string;
			channelPk: ChatMessage["pk"];
			chatMessageAssets: ChatMessageAsset[];
		}) => {
			if (!adChannel || !canUseAuthenticatedChat) return;
			const chatmessageasset_set = chatMessageAssets ?? [];
			try {
				const { data } = await instanceAxios({
					method: "post",
					url: `/chat/post-ad-channel-message/${adChannel.adType}/${adChannel.adId}`,
					data: { content, chatmessageasset_set },
				});
				if (!data?.pk) return;
				const newMessage: ChatMessage = {
					pk: data.pk,
					sender: data.sender ?? {
						pk: authenticatedUser!.pk,
						first_name: authenticatedUser!.firstName,
						last_name: authenticatedUser!.lastName ?? "",
						username: authenticatedUser!.username ?? "user",
						email: "",
						human_profile: {
							pk: authenticatedUser!.pk,
							profile_image_url: profilePicURL ?? "",
							bio: "",
							facebook_url: "",
							instagram_url: "",
							linked_in_url: "",
							personal_website_url: "",
						},
					},
					content: data.content ?? content,
					timestamp: data.timestamp ?? new Date().toISOString(),
					reaction_set: data.reaction_set ?? [],
					chatmessageasset_set:
						data.chatmessageasset_set ??
						chatmessageasset_set.map((a, i) => ({
							asset_url: a.asset_url,
							asset_type: a.asset_type,
							pk: i + 1,
						})),
					num_replies: data.num_replies ?? 0,
				};
				setAdChannelMessages((prev) => ({
					...prev,
					results: [...prev.results, newMessage],
					count: prev.count + 1,
				}));
				adVirtuosoRef.current?.data?.append([newMessage], () => ({
					index: "LAST",
					align: "end",
					behavior: "smooth",
				}));

				await axios.post("/api/pusher", {
					channel: `ad-${adChannel.adType}-${adChannel.adId}`,
					event: "new-message",
					data: {
						text: data.content ?? content,
						metadata: {
							message_type: "ad_channel_message",
							ad_id: adChannel.adId,
							ad_type: adChannel.adType,
							pk: data.pk,
							timestamp: data.timestamp ?? new Date().toISOString(),
							reaction_set: data.reaction_set ?? [],
							num_replies: data.num_replies ?? 0,
							chatmessageasset_set:
								data.chatmessageasset_set ?? newMessage.chatmessageasset_set,
							sender: newMessage.sender,
						},
					},
				});
				trackEvent({
					channel: "chat-message",
					event: "Ad channel message sent",
					description: `ad_type:${adChannel.adType} ad_id:${adChannel.adId} ${buildChatMessageSentDescription(
						{
							channelPk: adChannel.adId,
							channel: null,
							senderEmail: authenticatedUser?.email,
							senderPk: authenticatedUser?.pk,
						},
					)}`,
					functionName: "useChat > handleSendAdChannelMessage",
				});
				capturePosthogEvent("chat_message_sent", {
					channel: "ad",
					type: "original",
				});
			} catch (err) {
				reportChatError(err, "handleSendAdChannelMessage");
				throw err;
			}
		},
		[
			adChannel,
			canUseAuthenticatedChat,
			authenticatedUser,
			profilePicURL,
			reportChatError,
			capturePosthogEvent,
		],
	);

	const handleSendThreadMessage = async ({
		channel,
		content,
		threadMessageAssets,
		parentChatMessagePk,
	}: {
		channel: Channel | null;
		content: string;
		parentChatMessagePk: ThreadMessage["pk"];
		threadMessageAssets: ChatMessageAsset[];
	}) => {
		if (!canUseAuthenticatedChat) {
			return;
		}

		try {
			const { data: created } = await instanceAxios({
				method: "post",
				url: `/chat/send-thread-message`,
				data: {
					content,
					parent_chat_message: parentChatMessagePk,
					threadmessageasset_set: threadMessageAssets,
				},
			});

			const newMessage: ThreadMessage = {
				pk: created?.pk,
				timestamp: created?.timestamp ?? new Date().toISOString(),
				sender: created?.sender ?? {
					pk: authenticatedUser?.pk ?? 0,
					username: authenticatedUser?.username ?? "",
					first_name: authenticatedUser?.firstName ?? "",
					last_name: authenticatedUser?.lastName ?? "",
					email: "",
					human_profile: {
						pk: 0,
						profile_image_url: profilePicURL ?? "",
						bio: "",
						facebook_url: "",
						instagram_url: "",
						linked_in_url: "",
						personal_website_url: "",
					},
				},
				content: created?.content ?? content,
				reaction_set: created?.reaction_set ?? [],
				threadmessageasset_set:
					created?.threadmessageasset_set ??
					threadMessageAssets.map((a) => ({
						asset_type: a.asset_type,
						asset_url: a.asset_url,
					})),
			};

			if (threadPreviewMessage?.pk === parentChatMessagePk) {
				setActiveThreadMessages((prev) => ({
					...prev,
					results: [...prev.results, newMessage],
				}));
				virtuosoThreadRef?.current?.data?.append([newMessage], () => ({
					index: "LAST",
					align: "end",
					behavior: "smooth",
				}));
				setThreadPreviewMessage((prev) =>
					prev && prev.pk === parentChatMessagePk
						? ({
								...prev,
								num_replies: (prev.num_replies ?? 0) + 1,
							} as ThreadPreviewMessage)
						: prev,
				);
			}

			// Update parent reply count in the visible message list (channel or ad chat)
			if (channel) {
				setChannelMessages((prev) => {
					const newResults = prev.results.map((msg) =>
						msg.pk === parentChatMessagePk
							? { ...msg, num_replies: (msg.num_replies || 0) + 1 }
							: msg,
					);
					virtuosoChannelRef?.current?.data?.replace(newResults);
					return { ...prev, results: newResults };
				});

				await axios.post("/api/pusher", {
					channel: String(channel.pk),
					event: "new-message",
					data: {
						text: content,
						metadata: {
							pk: created?.pk ?? uuidv4(),
							timestamp: newMessage.timestamp,
							threadmessageasset_set: newMessage.threadmessageasset_set,
							message_type: "thread_message",
							parent_chat_message_pk: parentChatMessagePk,
							channel_pk: channel.pk,
							sender: newMessage.sender,
						},
					},
				});

				trackEvent({
					channel: "chat-thread-messages",
					event: "Thread reply sent",
					description: `parent_chat_message_pk:${parentChatMessagePk} channel_pk:${channel.pk} content_length:${content?.length ?? 0} asset_count:${threadMessageAssets?.length ?? 0}`,
					functionName: "useChat > handleSendThreadMessage",
				});
				capturePosthogEvent("chat_message_sent", {
					channel: posthogMessageChannel(channel),
					type: "thread",
				});
			} else if (adChannel) {
				// Ad chat thread: update parent reply count in ad channel message list
				setAdChannelMessages((prev) => {
					const newResults = prev.results.map((msg) =>
						msg.pk === parentChatMessagePk
							? { ...msg, num_replies: (msg.num_replies || 0) + 1 }
							: msg,
					);
					adVirtuosoRef.current?.data?.replace(newResults);
					return { ...prev, results: newResults };
				});

				// Broadcast so other users viewing this ad see the reply count update
				await axios.post("/api/pusher", {
					channel: `ad-${adChannel.adType}-${adChannel.adId}`,
					event: "new-message",
					data: {
						text: content,
						metadata: {
							message_type: "thread_message",
							parent_chat_message_pk: parentChatMessagePk,
							ad_id: adChannel.adId,
							ad_type: adChannel.adType,
							pk: created?.pk ?? uuidv4(),
							timestamp: newMessage.timestamp,
							threadmessageasset_set: newMessage.threadmessageasset_set,
							sender: newMessage.sender,
						},
					},
				});

				trackEvent({
					channel: "chat-thread-messages",
					event: "Thread reply sent",
					description: `parent_chat_message_pk:${parentChatMessagePk} ad_type:${adChannel.adType} ad_id:${adChannel.adId} content_length:${content?.length ?? 0} asset_count:${threadMessageAssets?.length ?? 0}`,
					functionName: "useChat > handleSendThreadMessage",
				});
				capturePosthogEvent("chat_message_sent", {
					channel: "ad",
					type: "thread",
				});
			}
		} catch (error) {
			reportChatError(error, "handleSendThreadMessage");
			throw error;
		}
	};

	const handleSetActiveChannel = (channel: Channel) => {
		try {
			if (channel.pk === activeChannel?.pk) return;
			setIsLoadingInitialChannelMessages(true);
			setChannelMessages({
				results: [],
				next: null,
				previous: null,
				count: 0,
			});
			setActiveChannel(channel);
			void fetchInitialMessagesForChannel(channel);
			void markChannelAsRead(channel.pk);
		} catch (error) {
			reportChatError(error, "handleSetActiveChannel");
		}
	};

	const getIsChannelUnread = (channel: Channel) => {
		try {
			if (isChatView && channelPksEqual(channel.pk, activeChannel?.pk)) {
				return false;
			}

			const channelPk = normalizeChannelPk(channel.pk);
			const hasUnreadMessages =
				(channelPk != null && localUnreadChannelPks.includes(channelPk)) ||
				effectiveUnreadChannels.some((unreadChannel) =>
					channelPksEqual(unreadChannel.pk, channel.pk),
				);
			const hasUnreadThreads = unreadThreads?.some((thread) =>
				channelPksEqual(thread.channel_pk, channel.pk),
			);
			return Boolean(hasUnreadMessages || hasUnreadThreads);
		} catch (error) {
			reportChatError(error, "getIsChannelUnread");
			return false;
		}
	};

	const getIsThreadPreviewMessageUnread = (thread: ThreadPreviewMessage) => {
		try {
			if (isWatchedThreadsView && thread.pk === threadPreviewMessage?.pk) {
				return false;
			}

			return unreadThreads?.some(
				(unreadThread: UnreadThread) => unreadThread.pk === thread.pk,
			);
		} catch (error) {
			reportChatError(error, "getIsThreadPreviewMessageUnread");
			return false;
		}
	};

	const handleAddChatMessageReaction = async ({
		emoji_id,
		chat_message,
	}: {
		chat_message: number;
		emoji_id: string;
	}) => {
		if (!canUseAuthenticatedChat) {
			const error = new Error("User is not logged in");
			reportChatError(error, "handleAddChatMessageReaction");
			throw error;
		}

		try {
			await instanceAxios({
				method: "post",
				url: `/chat/add-chat-message-reaction`,
				data: {
					emoji_id,
					chat_message,
				},
			});
		} catch (error) {
			reportChatError(error, "handleAddChatMessageReaction");
			throw error;
		}
	};

	const handleSetThreadPreviewMessage = useCallback(
		(parentChatMessage: ChatMessage | ThreadPreviewMessage | null) => {
			try {
				const listRef = adChannel ? adVirtuosoRef : virtuosoChannelRef;
				const results = adChannel
					? adChannelMessages.results
					: channelMessages.results;
				const count = results.length;
				const location = listRef?.current?.getScrollLocation?.();
				if (location && count > 0) {
					const openedMessageIndex =
						parentChatMessage != null
							? results.findIndex(
									(m: ChatMessage) => m.pk === parentChatMessage.pk,
								)
							: -1;
					channelScrollBeforeThreadOpenRef.current = {
						location,
						count,
						useAdRef: Boolean(adChannel),
						...(openedMessageIndex >= 0 && {
							scrollToIndex: openedMessageIndex,
						}),
					};
				} else {
					channelScrollBeforeThreadOpenRef.current = null;
				}
				setThreadPreviewMessage(parentChatMessage);
				if (!parentChatMessage) {
					threadPanelJustClosedRef.current = true;
					// Close thread panel: remove thread from URL so refresh doesn't reopen it
					const { thread: _t, ...restQuery } = router.query;
					if (_t != null) {
						router.replace(
							{ pathname: router.pathname, query: restQuery },
							undefined,
							{ shallow: true },
						);
					}
					return;
				}
				if (threadPreviewMessage?.pk === parentChatMessage.pk) {
					return;
				}
				// Open thread panel: persist thread (and channel on /chat) in URL so refresh keeps it open
				const query: Record<string, string | number> = {
					...router.query,
					thread: parentChatMessage.pk,
				};
				if (
					router.pathname === "/chat" &&
					(activeChannel ?? parentChatMessage.channel)
				) {
					query.channel = (activeChannel ?? parentChatMessage.channel)!.pk;
				}
				router.replace({ pathname: router.pathname, query }, undefined, {
					shallow: true,
				});
				setActiveThreadMessages({
					results: [],
					next: null,
					previous: null,
					count: 0,
				});
				fetchInitialMessagesForThread(parentChatMessage);
				markThreadAsRead(parentChatMessage.pk);

				// Clear unread dot on reply count for this message in the list (map updates in place, avoids full replace + scroll jump)
				const clearUnreadOnMessage = (msg: ChatMessage) =>
					msg.pk === parentChatMessage.pk
						? { ...msg, has_unread_replies: false }
						: msg;
				virtuosoChannelRef?.current?.data?.map((msg: ChatMessage) =>
					msg.pk === parentChatMessage.pk
						? { ...msg, has_unread_replies: false }
						: msg,
				);
				adVirtuosoRef.current?.data?.map((msg: ChatMessage) =>
					msg.pk === parentChatMessage.pk
						? { ...msg, has_unread_replies: false }
						: msg,
				);
				setChannelMessages((prev) => ({
					...prev,
					results: prev.results.map(clearUnreadOnMessage),
				}));
				setAdChannelMessages((prev) => ({
					...prev,
					results: prev.results.map(clearUnreadOnMessage),
				}));
			} catch (error) {
				reportChatError(error, "handleSetThreadPreviewMessage");
			}
		},
		[
			adChannel,
			adChannelMessages.results,
			channelMessages.results,
			activeChannel,
			fetchInitialMessagesForThread,
			markThreadAsRead,
			router,
			reportChatError,
			threadPreviewMessage?.pk,
		],
	);

	// Restore channel list scroll position after thread panel opens or closes
	useEffect(() => {
		if (!channelScrollBeforeThreadOpenRef.current) return;
		const saved = channelScrollBeforeThreadOpenRef.current;
		channelScrollBeforeThreadOpenRef.current = null;
		const listRef = saved.useAdRef ? adVirtuosoRef : virtuosoChannelRef;

		const restore = () => {
			try {
				const { location, count } = saved;
				if (count <= 0) return;
				if (saved.scrollToIndex !== undefined) {
					listRef?.current?.scrollToItem({
						index: saved.scrollToIndex,
						align: "start",
						behavior: "instant",
					});
					return;
				}
				if (location.isAtBottom) {
					listRef?.current?.scrollToItem({
						index: "LAST",
						align: "end",
						behavior: "instant",
					});
					return;
				}
				if (location.scrollHeight > 0) {
					const index = Math.max(
						0,
						Math.min(
							count - 1,
							Math.floor(
								(-location.listOffset / location.scrollHeight) * count,
							),
						),
					);
					listRef?.current?.scrollToItem({
						index,
						align: "start",
						behavior: "instant",
					});
				}
			} catch (error) {
				reportChatError(error, "restoreChannelScrollAfterThreadPanel");
			}
		};

		const rafId = requestAnimationFrame(() => {
			requestAnimationFrame(restore);
		});
		return () => cancelAnimationFrame(rafId);
	}, [threadPreviewMessage, reportChatError]);

	// When navigating from notifications dropdown with ?thread=<pk>, open the thread panel for that parent message
	useEffect(() => {
		const openThreadFromUrl = () => {
			try {
				const threadPkParam = router.query.thread;
				if (threadPkParam == null || !router.isReady) return;
				const threadPk =
					typeof threadPkParam === "string"
						? Number(threadPkParam)
						: Number(threadPkParam[0]);
				if (Number.isNaN(threadPk)) return;

				// User just closed the panel; URL hasn't updated yet — don't reopen
				if (threadPanelJustClosedRef.current) {
					threadPanelJustClosedRef.current = false;
					return;
				}

				// Already showing this thread: do nothing (URL keeps thread param so refresh keeps panel open)
				if (threadPreviewMessage?.pk === threadPk) {
					return;
				}

				// User switched threads locally; URL is stale until router.replace completes
				if (
					threadPreviewMessage != null &&
					threadPreviewMessage.pk !== threadPk
				) {
					const query: Record<string, string | number> = {
						...router.query,
						thread: threadPreviewMessage.pk,
					};
					if (
						router.pathname === "/chat" &&
						(activeChannel ?? threadPreviewMessage.channel)
					) {
						query.channel = (activeChannel ?? threadPreviewMessage.channel)!.pk;
					}
					router.replace({ pathname: router.pathname, query }, undefined, {
						shallow: true,
					});
					return;
				}

				// Chat view: ensure we're on the right channel and have the message
				if (isChatView) {
					const channelPkParam = router.query.channel;
					const channelPk =
						channelPkParam != null
							? typeof channelPkParam === "string"
								? Number(channelPkParam)
								: Number(channelPkParam[0])
							: null;
					if (
						channelPk != null &&
						!Number.isNaN(channelPk) &&
						activeChannel?.pk === channelPk &&
						channelMessages.results.length > 0
					) {
						const parentMessage = channelMessages.results.find(
							(m: ChatMessage) => m.pk === threadPk,
						);
						if (parentMessage) {
							const messageWithChannel = {
								...parentMessage,
								channel: parentMessage.channel ?? activeChannel,
							};
							handleSetThreadPreviewMessage(messageWithChannel);
						}
					}
					return;
				}

				// Ad view: we have ad channel messages and the parent is in the list
				if (adChannel && adChannelMessages.results.length > 0) {
					const parentMessage = adChannelMessages.results.find(
						(m: ChatMessage) => m.pk === threadPk,
					);
					if (parentMessage) {
						handleSetThreadPreviewMessage(parentMessage);
					}
				}
			} catch (error) {
				reportChatError(error, "openThreadFromUrl");
			}
		};

		openThreadFromUrl();
	}, [
		router.isReady,
		router.query.thread,
		router.query.channel,
		router.pathname,
		router.query,
		isChatView,
		activeChannel?.pk,
		channelMessages.results,
		adChannel,
		adChannelMessages.results,
		handleSetThreadPreviewMessage,
		router,
		threadPreviewMessage?.pk,
		reportChatError,
	]);

	const isThreadPanelOpen = useMemo(() => {
		return Boolean(threadPreviewMessage);
	}, [threadPreviewMessage]);

	const isAdChatInputDisabled = Boolean(
		adChannel && (adChannel.status === "archived" || !isLoggedIn),
	);

	return (
		<ChatContext.Provider
			value={{
				activeChannel: adChannel ? null : activeChannel,
				activeThreadMessages,
				channelMessages: adChannel ? adChannelMessages : channelMessages,
				clearAdChannel,
				fetchWatchedThreads,
				getIsChannelUnread,
				getIsThreadPreviewMessageUnread,
				handleAddChatMessageReaction,
				handleAddThreadMessageReaction: noop,
				handleCreateChannel,
				handleSendChatMessage: adChannel
					? handleSendAdChannelMessage
					: handleSendChatMessage,
				handleSendThreadMessage,
				hasAnyUnreadMessages,
				hasAnyUnreadThreads,
				isAdChatInputDisabled,
				isConnectingToPusher: canUseAuthenticatedChat && isConnectingToPusher,
				isLoadingInitialChannelMessages: adChannel
					? isLoadingAdChannelMessages
					: isLoadingInitialChannelMessages,
				isLoadingInitialThreadMessages,
				isLoadingInitialWatchedThreads,
				isLoadingNewerChannelMessages,
				isLoadingNewerThreadMessages: false,
				isLoadingNewerWatchedThreads,
				isLoadingPrivateChannels,
				isLoadingPublicChannels,
				isMobileSidebarOpen,
				isThreadPanelOpen,
				markChannelAsRead,
				onChannelScroll,
				onThreadScroll,
				onWatchedThreadsScroll,
				privateChannels,
				publicChannels,
				isPusherConnected,
				isPusherDisconnected,
				isPusherReconnecting,
				shouldShowPusherConnectionBanner,
				pusherStatus,
				retryPusherConnection,
				scrollToVirtuosoBottom,
				setActiveChannel: handleSetActiveChannel,
				setAdChannel,
				setIsMobileSidebarOpen: toggleMobileSidebar,
				setThreadPreviewMessage: handleSetThreadPreviewMessage,
				threadPreviewMessage: threadPreviewMessage,
				unreadChannels: effectiveUnreadChannels,
				unreadThreads: unreadThreads ?? [],
				virtuosoChannelRef: adChannel ? adVirtuosoRef : virtuosoChannelRef,
				virtuosoThreadRef,
				virtuosoWatchedThreadsRef,
				watchedThreads,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export const useChat = () => useContext(ChatContext);
