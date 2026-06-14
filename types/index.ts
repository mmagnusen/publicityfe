import type { JSONContent } from "@tiptap/core";

export type Validation = {
	bIsValid: boolean;
	strErrorMessage: string;
	/** When invalid, show message as helper (dark grey) and keep the normal input border. */
	bMutedMessage?: boolean;
};

export type UserProfile = {
	linkedIn: string;
	personalWebsite: string;
	pk: 1;
	profileImageUrl: string;
	richCv: string;
	shortBio: string;
};

export type AuthenticatedUser = {
	email: string;
	emailVerified?: boolean;
	identityVerified?: boolean;
	/** Latest IdentityVerification.status from API (`null` = never started). */
	identityVerificationStatus?: string | null;
	identityVerificationError?: string | null;
	firstName: string;
	groups?: { name: string }[];
	humanProfile?: UserProfile;
	lastName: string;
	pk: number;
	profileImageUrl?: string;
	/** Read-only; user’s own code for sharing (`?invite=`). */
	referral_code?: string;
	reward_points?: number;
	token: string;
	username: string;
	hasActiveSubscription: boolean;
};

export type ChatMessage = {
	first_name: string;
	last_name: string;
	message: string;
	pk: number;
	thread_pk: number;
	timestamp: string;
	user_profile_image_url: string;
	username: string;
};

/** Notification item from the API (notifications dropdown/list) */
export type Notification = {
	id: number;
	created_at: string;
	is_read: boolean;
	notification_type: string;
	object_id: number;
	/** Optional; may be populated by API or derived from notification_type */
	description?: string;
};

export type HandleAxiosFormErrors = Record<string, string[]>;

export const RichTextDefaultValues: RichTextContent = {
	characterCount: 0,
	editorHTML: "",
	editorJSON: { type: "doc", content: [] },
	wordCount: 0,
};

export type RichTextContent = {
	characterCount: number;
	editorHTML: string;
	editorJSON: JSONContent;
	wordCount: number;
};
