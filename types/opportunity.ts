import type { Tag } from "@customTypes/tag";

export type ApiOpportunity = {
	pk: number;
	title: string;
	type?: string | null;
	short_description: string;
	full_description: string;
	media_outlet: number | null;
	media_outlet_name?: string | null;
	tags?: Tag[];
	creator?: number | { pk?: number | null; username?: string | null } | null;
	creator_pk?: number | null;
	creator_username?: string | null;
	application_deadline?: string | null;
	is_favorited?: boolean;
	status?: string | null;
	created_at?: string;
	updated_at?: string;
};

export type OpportunitiesPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ApiOpportunity[];
};

export type OpportunityCreatePayload = {
	title: string;
	type?: string;
	short_description: string;
	full_description: string;
	media_outlet?: number | null;
	application_deadline?: string | null;
};

export type OpportunitySetFavoritePayload = {
	opportunity_id: number;
	is_favorited: boolean;
};

export type OpportunitySetFavoriteResponse = {
	opportunity_id: number;
	is_favorited: boolean;
};

export type OpportunityUpdatePayload = Partial<OpportunityCreatePayload> & {
	status?: string;
};

/** Row from GET /opportunities/fetch-my-favorites (may wrap the opportunity). */
export type OpportunityFavoriteRecord = {
	pk?: number;
	opportunity_id?: number;
	opportunity?: Partial<ApiOpportunity> & { pk?: number };
};
