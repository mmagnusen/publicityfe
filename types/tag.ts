export type Tag = {
	pk: number;
	name: string;
	created_at?: string;
	updated_at?: string;
};

export type TagsPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: Tag[];
};

export type TagCreatePayload = {
	name: string;
};

export type TagUpdatePayload = Partial<TagCreatePayload>;
