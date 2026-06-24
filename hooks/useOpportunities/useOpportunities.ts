import axios from "axios";
import useSWR, { mutate } from "swr";

import type {
	ApiOpportunity,
	OpportunitiesPaginatedResponse,
	OpportunityCreatePayload,
	OpportunityFavoriteRecord,
	OpportunityUpdatePayload,
} from "@customTypes/opportunity";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";
import { instanceAxios } from "@util/instanceAxios";

export const OPPORTUNITIES_BASE = "/opportunities";

/** Public catalog- no auth required. */
export const OPPORTUNITIES_LIST_PATH = `${OPPORTUNITIES_BASE}/opportunities`;

export const opportunityDetailPath = (pk: number) =>
	`${OPPORTUNITIES_BASE}/single-opportunity/${pk}`;

/** Staff CRUD- requires admin auth. */
export const OPPORTUNITIES_ADMIN_LIST_PATH = `${OPPORTUNITIES_BASE}/admin/opportunities`;

export const opportunityAdminDetailPath = (pk: number) =>
	`${OPPORTUNITIES_BASE}/admin/single-opportunity/${pk}`;

/** Opportunities created by the authenticated user. */
export const MY_OPPORTUNITIES_PATH = `${OPPORTUNITIES_BASE}/my-opportunities`;

/** Favourites- requires auth. */
export const OPPORTUNITY_SET_FAVORITE_PATH = `${OPPORTUNITIES_BASE}/set-favorite`;
export const OPPORTUNITY_FETCH_MY_FAVORITES_PATH = `${OPPORTUNITIES_BASE}/fetch-my-favorites`;

export const OPPORTUNITIES_PER_PAGE = 20;

export const opportunitiesListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${OPPORTUNITIES_LIST_PATH}?${query.toString()}`;
};

export const adminOpportunitiesListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${OPPORTUNITIES_ADMIN_LIST_PATH}?${query.toString()}`;
};

export const myOpportunitiesListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${MY_OPPORTUNITIES_PATH}?${query.toString()}`;
};

export const myFavouriteOpportunitiesListKey = (
	page: number,
	perPage: number,
) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${OPPORTUNITY_FETCH_MY_FAVORITES_PATH}?${query.toString()}`;
};

export type NormalizedOpportunityList = {
	results: OpportunitiesPaginatedResponse["results"];
	count: number;
	next: string | null;
	previous: string | null;
};

export const normalizeOpportunityListResponse = (
	data: unknown,
): NormalizedOpportunityList => {
	if (data == null) {
		return { results: [], count: 0, next: null, previous: null };
	}

	if (Array.isArray(data)) {
		return {
			results: data,
			count: data.length,
			next: null,
			previous: null,
		};
	}

	const page = data as Partial<OpportunitiesPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

const isOpportunityFavoriteRecord = (
	item: unknown,
): item is OpportunityFavoriteRecord =>
	item != null &&
	typeof item === "object" &&
	"opportunity" in item &&
	(item as { opportunity?: unknown }).opportunity != null &&
	typeof (item as { opportunity?: unknown }).opportunity === "object";

export const getOpportunityPkFromItem = (
	item: ApiOpportunity | OpportunityFavoriteRecord,
): number | null => {
	if (isOpportunityFavoriteRecord(item)) {
		const pk = item.opportunity?.pk ?? item.opportunity_id ?? item.pk;
		return pk != null && pk > 0 ? pk : null;
	}

	const pk = (item as ApiOpportunity).pk;
	return pk != null && pk > 0 ? pk : null;
};

export const extractOpportunityFromFavoriteItem = (
	item: ApiOpportunity | OpportunityFavoriteRecord,
): ApiOpportunity | null => {
	if (isOpportunityFavoriteRecord(item)) {
		const nested = item.opportunity;
		if (!nested) {
			return null;
		}

		const pk = nested.pk ?? item.opportunity_id ?? item.pk;
		if (pk == null || pk <= 0) {
			return null;
		}

		return {
			pk,
			title: nested.title ?? "",
			short_description: nested.short_description ?? "",
			full_description: nested.full_description ?? "",
			media_outlet: nested.media_outlet ?? null,
			media_outlet_name: nested.media_outlet_name,
			creator: nested.creator,
			creator_pk: nested.creator_pk,
			creator_username: nested.creator_username,
			application_deadline: nested.application_deadline,
			is_favorited: true,
			created_at: nested.created_at,
			updated_at: nested.updated_at,
		};
	}

	const flat = item as ApiOpportunity;
	if (flat.pk == null || flat.pk <= 0) {
		return null;
	}

	return {
		...flat,
		title: flat.title ?? "",
		short_description: flat.short_description ?? "",
		full_description: flat.full_description ?? "",
		is_favorited: flat.is_favorited ?? true,
	};
};

export const normalizeFavoriteOpportunitiesResponse = (
	data: unknown,
): NormalizedOpportunityList => {
	const base = normalizeOpportunityListResponse(data);

	return {
		...base,
		results: base.results
			.map((item) => extractOpportunityFromFavoriteItem(item))
			.filter((item): item is ApiOpportunity => item != null),
	};
};

export const useOpportunities = (
	page: number,
	perPage: number = OPPORTUNITIES_PER_PAGE,
) => {
	return useSWR<OpportunitiesPaginatedResponse>(
		opportunitiesListKey(page, perPage),
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useAdminOpportunities = (
	page: number,
	perPage: number = OPPORTUNITIES_PER_PAGE,
) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<OpportunitiesPaginatedResponse>(
		isLoggedIn && isAdmin ? adminOpportunitiesListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useMyOpportunities = (
	page: number,
	perPage: number = OPPORTUNITIES_PER_PAGE,
) => {
	const { isLoggedIn } = useAuthenticatedUser();

	return useSWR<OpportunitiesPaginatedResponse>(
		isLoggedIn ? myOpportunitiesListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useMyFavouriteOpportunities = (
	page: number,
	perPage: number = OPPORTUNITIES_PER_PAGE,
) => {
	const { isLoggedIn } = useAuthenticatedUser();

	return useSWR<OpportunitiesPaginatedResponse>(
		isLoggedIn ? myFavouriteOpportunitiesListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useOpportunity = (pk: number | null) => {
	const detailPath =
		pk != null && Number.isFinite(pk) && pk > 0
			? opportunityDetailPath(pk)
			: null;

	return useSWR<ApiOpportunity>(detailPath, fetcher);
};

export const useAdminOpportunity = (pk: number | null) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();
	const detailPath =
		pk != null && Number.isFinite(pk) && pk > 0
			? opportunityAdminDetailPath(pk)
			: null;

	return useSWR<ApiOpportunity>(
		isLoggedIn && isAdmin && detailPath ? detailPath : null,
		fetcher,
	);
};

export const createOpportunity = async (
	payload: OpportunityCreatePayload,
): Promise<ApiOpportunity> => {
	const { data } = await instanceAxios.post<ApiOpportunity>(
		OPPORTUNITIES_ADMIN_LIST_PATH,
		payload,
	);
	return data;
};

export const patchOpportunity = async (
	pk: number,
	payload: OpportunityUpdatePayload,
): Promise<ApiOpportunity> => {
	const { data } = await instanceAxios.patch<ApiOpportunity>(
		opportunityAdminDetailPath(pk),
		payload,
	);
	return data;
};

export const deleteOpportunity = async (pk: number): Promise<void> => {
	await instanceAxios.delete(opportunityAdminDetailPath(pk));
};

export const revalidateOpportunityLists = async () => {
	await mutate(
		(key) =>
			typeof key === "string" &&
			(key.startsWith(OPPORTUNITIES_LIST_PATH) ||
				key.startsWith(OPPORTUNITIES_ADMIN_LIST_PATH) ||
				key.startsWith(MY_OPPORTUNITIES_PATH) ||
				key.startsWith(OPPORTUNITY_FETCH_MY_FAVORITES_PATH)),
		undefined,
		{ revalidate: true },
	);
};

export const revalidateOpportunityDetailCaches = async (pk: number) => {
	await mutate(opportunityDetailPath(pk));
	await mutate(opportunityAdminDetailPath(pk));
};

export const getOpportunityApiErrorMessage = (error: unknown): string => {
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
