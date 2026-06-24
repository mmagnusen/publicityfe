export type WaitlistEntry = {
	pk: number;
	first_name: string;
	email: string;
	created_at?: string;
};

export type WaitlistEntriesPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: WaitlistEntry[];
};
