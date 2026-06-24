import axios from "axios";

import type {
	ShopItem,
	ShopItemCreatePayload,
	ShopItemsPaginatedResponse,
	ShopItemUpdatePayload,
} from "@customTypes/shop";
import { instanceAxios } from "@util/instanceAxios";

export type NormalizedShopList = {
	results: ShopItem[];
	count: number;
	next: string | null;
	previous: string | null;
};

/** Accept DRF page shape or a raw array from the API. */
export const normalizeShopListResponse = (
	data: unknown,
): NormalizedShopList => {
	if (data == null) {
		return { results: [], count: 0, next: null, previous: null };
	}
	if (Array.isArray(data)) {
		return {
			results: data as ShopItem[],
			count: data.length,
			next: null,
			previous: null,
		};
	}
	const page = data as Partial<ShopItemsPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

export const createShopItem = async (
	payload: ShopItemCreatePayload,
): Promise<ShopItem> => {
	const { data } = await instanceAxios.post<ShopItem>("/shop/items", payload);
	return data;
};

export const patchShopItem = async (
	id: number,
	payload: ShopItemUpdatePayload,
): Promise<ShopItem> => {
	const { data } = await instanceAxios.patch<ShopItem>(
		`/shop/items/${id}`,
		payload,
	);
	return data;
};

export const deleteShopItem = async (id: number): Promise<void> => {
	await instanceAxios.delete(`/shop/items/${id}`);
};

/** POST /shop/items/:id/purchase-with-points- authenticated */
export type PurchaseWithPointsResponse = {
	order_id?: number | string;
	points_spent?: number;
	reward_points_balance?: number;
	item_id?: number;
};

export const purchaseShopItemWithPoints = async (
	id: number,
): Promise<PurchaseWithPointsResponse> => {
	const { data } = await instanceAxios.post<PurchaseWithPointsResponse>(
		`/shop/items/${id}/purchase-with-points`,
		{},
	);
	return data;
};

/** Human-readable message from DRF-style validation errors. */
export const getShopApiErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data;
		if (data && typeof data === "object" && !Array.isArray(data)) {
			for (const [key, val] of Object.entries(data)) {
				if (
					Array.isArray(val) &&
					val.length > 0 &&
					typeof val[0] === "string"
				) {
					return `${key}: ${val[0]}`;
				}
				if (typeof val === "string") {
					return `${key}: ${val}`;
				}
			}
		}
		if (typeof data === "string") {
			return data;
		}
		return error.message || "Request failed";
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "Something went wrong.";
};
