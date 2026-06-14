import axios from "axios";

import type { User } from "@constants/user";
import { describe, expect, it } from "vitest";

import {
	buildChatMessageSentDescription,
	channelPksEqual,
	normalizeChannelPk,
	posthogMessageChannel,
	resolveChannelByPk,
} from "./helpers";
import type { Channel } from "./types";

const makeUser = (pk: number, email: string): User => ({
	pk,
	email,
	first_name: "Test",
	last_name: "User",
	username: `user${pk}`,
	registration_method: "email",
	email_verified: true,
	human_profile: {
		pk,
		bio: "",
		facebook_url: "",
		instagram_url: "",
		linked_in_url: "",
		personal_website_url: "",
		profile_image_url: "",
	},
});

describe("useChat helpers", () => {
	it("posthogMessageChannel maps ad vs dm", () => {
		expect(posthogMessageChannel({ channel_type: "ad" })).toBe("ad");
		expect(posthogMessageChannel({ channel_type: "direct_message" })).toBe(
			"dm",
		);
	});

	it("buildChatMessageSentDescription lists sender and recipients", () => {
		const channel: Channel = {
			pk: 10,
			name: "DM",
			channel_type: "direct_message",
			participants: [
				makeUser(1, "sender@example.com"),
				makeUser(2, "recipient@example.com"),
			],
		};

		expect(
			buildChatMessageSentDescription({
				channelPk: 10,
				channel,
				senderEmail: "sender@example.com",
				senderPk: 1,
			}),
		).toBe(
			"channel_pk:10 sender:sender@example.com recipients:recipient@example.com",
		);
	});

	it("resolveChannelByPk prefers active channel", () => {
		const active: Channel = {
			pk: 1,
			name: "Active",
			channel_type: "direct_message",
		};
		const other: Channel = { pk: 2, name: "Other", channel_type: "public" };

		expect(resolveChannelByPk(1, active, [other], [])).toBe(active);
		expect(resolveChannelByPk(2, active, [other], [])).toBe(other);
	});
});

describe("normalizeChannelPk", () => {
	it("coerces string and number PKs", () => {
		expect(normalizeChannelPk(5)).toBe(5);
		expect(normalizeChannelPk("5")).toBe(5);
		expect(normalizeChannelPk(null)).toBeNull();
	});

	it("compares PKs across types", () => {
		expect(channelPksEqual(5, "5")).toBe(true);
		expect(channelPksEqual(5, 6)).toBe(false);
	});
});
