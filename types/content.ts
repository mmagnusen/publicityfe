export type ContentBlock = {
	pk: number;
	slug: string;
	content: string;
};

export type ContentCreatePayload = {
	slug: string;
	content: string;
};

export type ContentUpdatePayload = Partial<ContentCreatePayload>;

export type ContentPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ContentBlock[];
};
