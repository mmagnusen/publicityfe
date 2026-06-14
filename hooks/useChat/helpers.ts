import type {
	Channel,
	ChatMessage,
	ThreadMessage,
	ThreadPreviewMessage,
} from "./types";

export type ThreadVirtuosoItem =
	| ChatMessage
	| ThreadMessage
	| ThreadPreviewMessage;

/** Parent channel message first (oldest), then thread replies in chronological order. */
export const buildThreadVirtuosoList = (
	parent: ChatMessage | ThreadPreviewMessage,
	replies: ThreadMessage[],
): ThreadVirtuosoItem[] => [
	parent,
	// ThreadMessage.pk can collide with ChatMessage.pk across tables.
	...replies.filter((reply) => reply.pk !== parent.pk),
];

export const EXISTING_DM_CHANNEL_MESSAGE =
	"A channel with these users already exists";

/** Coerce channel PKs from API/Pusher metadata (number | string) for reliable comparisons. */
export const normalizeChannelPk = (
	value: number | string | null | undefined,
): number | null => {
	if (value == null || value === "") {
		return null;
	}
	const pk = Number(value);
	return Number.isNaN(pk) ? null : pk;
};

export const channelPksEqual = (
	a: number | string | null | undefined,
	b: number | string | null | undefined,
): boolean => {
	const pkA = normalizeChannelPk(a);
	const pkB = normalizeChannelPk(b);
	if (pkA == null || pkB == null) {
		return false;
	}
	return pkA === pkB;
};

/** PostHog `channel`: ad listing chat vs DM/public (non-ad) channels. */
export const posthogMessageChannel = (
	channel: Pick<Channel, "channel_type"> | null | undefined,
): "dm" | "ad" => (channel?.channel_type === "ad" ? "ad" : "dm");

export const resolveChannelByPk = (
	channelPk: number,
	activeChannel: Channel | null,
	privateChannelResults: Channel[],
	publicChannelResults: Channel[],
): Channel | null => {
	if (activeChannel?.pk === channelPk) {
		return activeChannel;
	}
	return (
		privateChannelResults.find((channel) => channel.pk === channelPk) ??
		publicChannelResults.find((channel) => channel.pk === channelPk) ??
		null
	);
};

export const buildChatMessageSentDescription = ({
	channelPk,
	channel,
	senderEmail,
	senderPk,
}: {
	channelPk: number;
	channel: Channel | null;
	senderEmail: string | undefined;
	senderPk: number | undefined;
}): string => {
	const recipientEmails = (channel?.participants ?? [])
		.filter((participant) => Number(participant.pk) !== Number(senderPk))
		.map(
			(participant) => participant.email?.trim() || `user_pk:${participant.pk}`,
		);

	return [
		`channel_pk:${channelPk}`,
		`sender:${senderEmail?.trim() || "unknown"}`,
		`recipients:${recipientEmails.length > 0 ? recipientEmails.join(", ") : "(none)"}`,
	].join(" ");
};
