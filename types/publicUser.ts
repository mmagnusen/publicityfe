import type { Tag } from "@customTypes/tag";
import type { GalleryAsset } from "@hooks/useAdvertisement";

/** Public member profile from `/users/public-user/:username` (no email or auth fields). */
export type PublicUser = {
	pk: number;
	first_name: string;
	last_name: string;
	username: string;
	is_active: boolean;
	tags?: Tag[];
	human_profile: {
		pk: number;
		profile_image_url: string;
		city?: string;
		timezone?: string;
		facebook_url: string;
		instagram_url: string;
		linked_in_url: string;
		personal_website_url: string;
		bio: string;
		tagline?: string;
		/** Legacy alias; prefer `tagline`. */
		headline?: string;
	};
	customusergalleryasset_set: GalleryAsset[];
	has_active_subscription: boolean;
	email_verified: boolean;
	identity_verified: boolean;
};
