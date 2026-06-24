import type { JSONContent } from "@tiptap/core";

/** TipTap doc from the API, or legacy string/HTML storage. */
export type LocationHubNeighbourhoodDescription =
	| JSONContent
	| Record<string, unknown>
	| string
	| null;

/** Location hub as returned by staff read and public slug endpoints. */
export type LocationHub = {
	pk: number;
	slug: string;
	title: string;
	neighbourhood_description?: LocationHubNeighbourhoodDescription;
	/** Set by the API from the hub title / geocoding. */
	latitude?: number | null;
	longitude?: number | null;
	radius_miles?: number | null;
	/** Mean rent across listings in this hub’s search radius (pence per calendar month). */
	average_rent_pcm_in_pence?: number | null;
	/** Optional SEO title for `<title>`; falls back to generated copy when empty. */
	meta_title?: string | null;
	/** Optional SEO meta description; falls back to generated copy when empty. */
	meta_description?: string | null;
	created_at?: string;
	updated_at?: string;
};

export type LocationHubCreatePayload = {
	slug: string;
	title: string;
	/** TipTap doc object- not a JSON string (hub uses JSONField, unlike ad TextField). */
	neighbourhood_description?: JSONContent;
	meta_title?: string;
	meta_description?: string;
};

export type LocationHubUpdatePayload = Partial<LocationHubCreatePayload>;

export type LocationHubsPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: LocationHub[];
};
