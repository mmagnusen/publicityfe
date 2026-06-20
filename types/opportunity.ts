export type ApiOpportunity = {
	pk: number;
	title: string;
	short_description: string;
	full_description: string;
	media_outlet: number | null;
	media_outlet_name?: string | null;
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
	short_description: string;
	full_description: string;
	media_outlet?: number | null;
};

export type OpportunityUpdatePayload = Partial<OpportunityCreatePayload>;
