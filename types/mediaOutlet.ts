export type MediaOutlet = {
	pk: number;
	name: string;
	website_url: string;
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
};

export type MediaOutletUpdatePayload = Partial<MediaOutletCreatePayload>;
