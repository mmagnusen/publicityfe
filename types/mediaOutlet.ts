import type { Tag } from "@customTypes/tag";

export type MediaOutlet = {
	pk: number;
	name: string;
	website_url: string;
	founded_year?: number | null;
	tags?: Tag[];
	created_at?: string;
	updated_at?: string;
};

export type MediaOutletsPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: MediaOutlet[];
};

export type MediaOutletCreatePayload = {
	name: string;
	website_url: string;
	founded_year?: number | null;
	tag_pks?: number[];
};

export type MediaOutletUpdatePayload = Partial<MediaOutletCreatePayload>;
