import type { User } from "@constants/user";
import type { AdType } from "@hooks/useAdvertisement";
import type { VirtuosoMessageListProps } from "@virtuoso.dev/message-list";

export type ChannelType = "public" | "direct_message" | "ad";

export type Channel = {
	channel_type: ChannelType;
	name: string;
	participants?: User[];
	pk: number;
	/** When channel_type is "ad", nested ad info (preferred over flat ad_id/ad_type). */
	ad?: { ad_id: number; ad_type?: "offered_to_rent" | "wanted_to_rent" };
	/** When channel_type is "ad", the ad's primary key for the listing. */
	ad_id?: number;
	/** When channel_type is "ad", "offered_to_rent" | "wanted_to_rent" for URL segment. */
	ad_type?: "offered_to_rent" | "wanted_to_rent";
};

export type Reaction = {
	chat_message?: number;
	emoji_id: string;
	pk: number;
	timestamp: string;
	user: User;
};

export type MessageView = "thread" | "channel";

export type ChatMessageAsset = {
	asset_type: string;
	asset_url: string;
	chat_message?: ChatMessage;
	pk?: number;
};

export type ThreadMessageAsset = {
	asset_type: string;
	asset_url: string;
	pk?: number;
	thread_message?: ThreadMessage;
};

export type ChatMessage = {
	channel?: Channel;
	chatmessageasset_set: ChatMessageAsset[];
	content: string;
	/** True when the current user has unread replies to this message. */
	has_unread_replies?: boolean;
	num_replies: number;
	pk: number;
	reaction_set: Reaction[];
	sender: User;
	timestamp: string;
};

export type ThreadMessage = {
	content: string;
	pk: number;
	reaction_set: Reaction[];
	sender: User;
	threadmessageasset_set: ThreadMessageAsset[];
	timestamp: string;
};

export type ChatMessagesResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ChatMessage[];
};

export type ThreadMessagesResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ThreadMessage[];
};

export type ThreadPreviewMessage = {
	channel: Channel;
	chatmessageasset_set: ChatMessageAsset[];
	content: string;
	messages: {
		count: number;
		next: string | null;
		previous: string | null;
		results: ThreadMessage[];
		state: "initial" | "older" | "single-new";
	};
	num_replies: number | null;
	pk: number; // pk of the parent chat message
	reaction_set: Reaction[];
	sender: User;
	timestamp: string;
};

export type WatchedThreads = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ThreadPreviewMessage[];
};

export type UnreadChannel = {
	channel_type: ChannelType;
	name: string;
	pk: number;
	participants?: User[];
	ad: null | {
		ad_id: number;
		ad_type: AdType;
	};
};

export type UnreadThread = {
	pk: number; // parent chat message pk
	channel_pk?: number | null; // present for DM channel threads, null for ad threads
	channel_type?: ChannelType;
	name?: string; // Label: channel name for channel/DM, ad title for ad threads.
	participants?: User[]; // For channel/DM: list of participants (for “chat with X”); Empty array [] for ad.
	ad_id?: number; // For ad threads: listing id; null otherwise.
	ad_name?: string; // For ad threads: "wanted_to_rent" | "offered_to_rent"; null otherwise.
	ad_type?: AdType; //For ad threads: listing title; null otherwise.
};

type ChatChannel = Channel & {
	loaded: boolean;
};

interface MessageListContext {
	channel: ChatChannel;
}

export type VirtuosoProps = VirtuosoMessageListProps<
	ChatMessage,
	MessageListContext
>;
