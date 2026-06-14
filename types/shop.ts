/** Shop item as returned by GET /shop/items and GET /shop/items/:id */
export type ShopItem = {
	meta_title: string;
	meta_description: string;
	id: number;
	name: string;
	short_description: string;
	full_description: string;
	image_url: string;
	/** Cost in reward points (redeem via purchase-with-points). */
	points_price: number | null;
	sku: string | null;
	stock_quantity: number | null;
	is_active: boolean;
	/** When true, show a “Popular” badge on the public list (if provided by API). */
	is_popular?: boolean;
	created_at: string;
	updated_at: string;
};

/** Payload for POST /shop/items (omit read-only fields). */
export type ShopItemCreatePayload = {
	name: string;
	meta_title: string;
	meta_description: string;
	short_description?: string;
	full_description?: string;
	image_url?: string;
	points_price: number;
	sku?: string | null;
	stock_quantity?: number | null;
	is_active?: boolean;
};

/** Payload for PATCH /shop/items/:id */
export type ShopItemUpdatePayload = Partial<
	Omit<ShopItem, "id" | "created_at" | "updated_at">
>;

/** DRF paginated list when pagination is enabled */
export type ShopItemsPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ShopItem[];
};
