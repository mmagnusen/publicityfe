import axios from "axios";

import API_ENDPOINT from "@constants/apiEndpoints";
import { DEFAULT_PAGINATION_SIZE } from "@constants/pagination";
import type {
	LocationHub,
	LocationHubCreatePayload,
	LocationHubsPaginatedResponse,
	LocationHubUpdatePayload,
} from "@customTypes/locationHub";
import { instanceAxios } from "@util/instanceAxios";

const LOCATION_HUBS_BASE = "/location-hub";

export const locationHubDetailPath = (pk: number) =>
	`${LOCATION_HUBS_BASE}/location-hub/${pk}`;

export const locationHubBySlugPath = (slug: string) =>
	`${LOCATION_HUBS_BASE}/location-hub-by-slug/${slug}`;

/** Public paginated list (`/rooms` index, sitemap). */
export const publicLocationHubsPath = () => `${LOCATION_HUBS_BASE}/locations`;

export type NormalizedLocationHubList = {
	results: LocationHub[];
	count: number;
	next: string | null;
	previous: string | null;
};

export const normalizeLocationHubListResponse = (
	data: unknown,
): NormalizedLocationHubList => {
	if (data == null) {
		return { results: [], count: 0, next: null, previous: null };
	}
	if (Array.isArray(data)) {
		return {
			results: data as LocationHub[],
			count: data.length,
			next: null,
			previous: null,
		};
	}
	const page = data as Partial<LocationHubsPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

export const createLocationHub = async (
	payload: LocationHubCreatePayload,
): Promise<LocationHub> => {
	const { data } = await instanceAxios.post<LocationHub>(
		`${LOCATION_HUBS_BASE}/location-hubs`,
		payload,
	);
	return data;
};

export const patchLocationHub = async (
	pk: number,
	payload: LocationHubUpdatePayload,
): Promise<LocationHub> => {
	const { data } = await instanceAxios.patch<LocationHub>(
		locationHubDetailPath(pk),
		payload,
	);
	return data;
};

export const deleteLocationHub = async (pk: number): Promise<void> => {
	await instanceAxios.delete(locationHubDetailPath(pk));
};

/** Public paginated list for `/rooms` index (build + client fallback). */
export const fetchPublicLocationHubsIndexPage = async (
	page = 1,
	perPage = DEFAULT_PAGINATION_SIZE,
): Promise<NormalizedLocationHubList> => {
	const { data } = await axios.get<unknown>(
		`${API_ENDPOINT}${publicLocationHubsPath()}`,
		{ params: { page, per_page: perPage } },
	);

	return normalizeLocationHubListResponse(data);
};

/** Public read- no auth required. */
export const fetchLocationHubBySlug = async (
	slug: string,
): Promise<LocationHub> => {
	const { data } = await axios.get<LocationHub>(
		`${API_ENDPOINT}${locationHubBySlugPath(slug)}`,
	);
	return data;
};

/** All public hub slugs (paginated). Used for batch ISR revalidation. */
export const fetchPublicLocationHubSlugs = async (): Promise<string[]> => {
	const slugs: string[] = [];
	let page = 1;

	for (;;) {
		const { data } = await axios.get<unknown>(
			`${API_ENDPOINT}${publicLocationHubsPath()}`,
			{ params: { page, per_page: 100 } },
		);
		const normalized = normalizeLocationHubListResponse(data);
		for (const hub of normalized.results) {
			const hubSlug = hub.slug?.trim();
			if (hubSlug) {
				slugs.push(hubSlug);
			}
		}
		if (!normalized.next) {
			break;
		}
		page += 1;
	}

	return slugs;
};

export const getLocationHubApiErrorMessage = (error: unknown): string => {
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
