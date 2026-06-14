export type { PublicUser } from "../types/publicUser";

export type User = {
	email: string;
	first_name: string;
	human_profile: {
		bio: string;
		city?: string;
		facebook_url: string;
		instagram_url: string;
		linked_in_url: string;
		personal_website_url: string;
		pk: number;
		profile_image_url: string;
		timezone?: string;
	};
	last_name: string;
	pk: number;
	token?: string;
	registration_method: string;
	username: string;
	email_verified: boolean;
	/** Account active flag (`is_active` on the API). Omitted on some payloads; treat as active. */
	is_active?: boolean;
	/** True if the user has at least one verified Identity session on file (may still be true while a newer session is pending). */
	identity_verified?: boolean;
	identity_verification_status?: string | null;
	identity_verification_error?: string | null;
	/** When present on listing payloads, indicates an active premium subscription. */
	has_active_subscription?: boolean;
};

export type HumanProfile = {
	city: string;
	linkedIn: string;
	pk: 1;
	profileImageUrl: string;
	telephone: string;
	timezone: string;
};

export type AuthenticatedUser = {
	email: string;
	firstName: string;
	humanProfile: HumanProfile;
	lastName: string;
	pk: number;
	token: string;
	username: string;
	emailVerified: boolean;
	identityVerified?: boolean;
};
