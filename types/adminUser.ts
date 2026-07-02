import type { User } from "@constants/user";
import type { Tag } from "@customTypes/tag";

export type AdminUsersPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: User[];
};

export type AdminUserStatusFilter = "" | "active" | "inactive";

export type AdminUserDetail = User & {
	date_joined?: string;
	is_staff?: boolean;
	is_superuser?: boolean;
	tags?: Tag[];
	human_profile: User["human_profile"] & {
		tagline?: string;
		headline?: string;
		short_description?: string;
	};
};
