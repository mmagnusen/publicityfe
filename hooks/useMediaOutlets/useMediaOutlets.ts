import axios from "axios";
import useSWR, { mutate } from "swr";

import type {
	MediaOutlet,
	MediaOutletCreatePayload,
	MediaOutletsPaginatedResponse,
	MediaOutletUpdatePayload,
} from "@customTypes/mediaOutlet";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";
import { instanceAxios } from "@util/instanceAxios";

export const MEDIA_OUTLETS_BASE = "/media-outlets";

export const MEDIA_OUTLETS_LIST_PATH = `${MEDIA_OUTLETS_BASE}/media-outlets`;

export const mediaOutletDetailPath = (pk: number) =>
	`${MEDIA_OUTLETS_BASE}/single-media-outlet/${pk}`;

export const MEDIA_OUTLETS_PER_PAGE = 20;

export const ALL_MEDIA_OUTLETS_KEY = `${MEDIA_OUTLETS_LIST_PATH}?all=true`;

export const mediaOutletsListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${MEDIA_OUTLETS_LIST_PATH}?${query.toString()}`;
};

export type NormalizedMediaOutletList = {
	results: MediaOutletsPaginatedResponse["results"];
	count: number;
	next: string | null;
	previous: string | null;
};

export const normalizeMediaOutletListResponse = (
	data: unknown,
): NormalizedMediaOutletList => {
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

	const page = data as Partial<MediaOutletsPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

export const fetchAllMediaOutlets = async (): Promise<MediaOutlet[]> => {
	const outlets: MediaOutlet[] = [];
	let page = 1;

	for (;;) {
		const data = await fetcher(MEDIA_OUTLETS_LIST_PATH, {
			page,
			per_page: 100,
		});
		const normalized = normalizeMediaOutletListResponse(data);
		outlets.push(...normalized.results);

		if (!normalized.next) {
			break;
		}

		page += 1;
	}

	return outlets;
};

export const useAllMediaOutlets = () => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<MediaOutlet[]>(
		isLoggedIn && isAdmin ? ALL_MEDIA_OUTLETS_KEY : null,
		fetchAllMediaOutlets,
		{ revalidateOnMount: true },
	);
};

export const useMediaOutlets = (
	page: number,
	perPage: number = MEDIA_OUTLETS_PER_PAGE,
) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<MediaOutletsPaginatedResponse>(
		isLoggedIn && isAdmin ? mediaOutletsListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useMediaOutlet = (pk: number | null) => {
	const detailPath =
		pk != null && Number.isFinite(pk) && pk > 0
			? mediaOutletDetailPath(pk)
			: null;

	return useSWR<MediaOutlet>(detailPath, fetcher);
};

export const createMediaOutlet = async (
	payload: MediaOutletCreatePayload,
): Promise<MediaOutlet> => {
	const { data } = await instanceAxios.post<MediaOutlet>(
		MEDIA_OUTLETS_LIST_PATH,
		payload,
	);
	return data;
};

export const patchMediaOutlet = async (
	pk: number,
	payload: MediaOutletUpdatePayload,
): Promise<MediaOutlet> => {
	const { data } = await instanceAxios.patch<MediaOutlet>(
		mediaOutletDetailPath(pk),
		payload,
	);
	return data;
};

export const deleteMediaOutlet = async (pk: number): Promise<void> => {
	await instanceAxios.delete(mediaOutletDetailPath(pk));
};

export const revalidateMediaOutletLists = async () => {
	await mutate(
		(key) => typeof key === "string" && key.startsWith(MEDIA_OUTLETS_LIST_PATH),
		undefined,
		{ revalidate: true },
	);
};

export const getMediaOutletApiErrorMessage = (error: unknown): string => {
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
