import type { Channel, ChatMessage, ThreadMessage } from "@hooks/useChat";

/** Annotated on GET /chat/admin/messages results (channel + thread modes). */
export type AdminModerationMessageFields = {
	channel_message_count?: number;
};

/** GET /chat/admin/messages?type=channel */
export type AdminChatModerationChannelMessage = ChatMessage &
	AdminModerationMessageFields;

/** GET /chat/admin/messages?type=thread — may include channel context from parent. */
export type AdminChatModerationThreadMessage = ThreadMessage &
	AdminModerationMessageFields & {
		channel?: Channel;
		parent_chat_message?: number | { pk: number };
	};

/** DRF paginated list for channel-mode messages. */
export type AdminChatMessagesChannelResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: AdminChatModerationChannelMessage[];
};

/** DRF paginated list for thread-mode messages. */
export type AdminChatMessagesThreadResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: AdminChatModerationThreadMessage[];
};

/** GET /chat/admin/channels/<channel_pk>/messages — staff channel history (no last-read). */
export type AdminChannelMessagesResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ChatMessage[];
	channel: Channel;
};

/** Parent summary on GET /chat/admin/threads/<chat_message_pk>/messages */
export type AdminThreadParentSummary = Pick<
	ChatMessage,
	"pk" | "content" | "sender" | "timestamp" | "num_replies"
>;

/** GET /chat/admin/threads/<chat_message_pk>/messages — staff thread history (no last-read). */
export type AdminThreadMessagesResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ThreadMessage[];
	parent_message: AdminThreadParentSummary;
	channel: Channel;
};

/** GET /chat/admin/users/<user_pk>/channels — channels the user has contributed to. */
export type AdminUserContributedChannel = Channel & {
	last_message_at?: string | null;
	channel_message_count?: number;
	participant_count?: number;
};

export type AdminUserContributedChannelsResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: AdminUserContributedChannel[];
};
