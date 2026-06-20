import axios from "axios";
import useSWR, { mutate } from "swr";

import type {
	Tag,
	TagCreatePayload,
	TagsPaginatedResponse,
	TagUpdatePayload,
} from "@customTypes/tag";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";
import { instanceAxios } from "@util/instanceAxios";

export const TAGS_BASE = "/tags";

export const TAGS_LIST_PATH = `${TAGS_BASE}/tags`;

export const TAGS_ADMIN_LIST_PATH = `${TAGS_BASE}/admin/tags`;

export const tagAdminDetailPath = (pk: number) =>
	`${TAGS_BASE}/admin/single-tag/${pk}`;

export const TAGS_PER_PAGE = 20;

export const ALL_TAGS_KEY = `${TAGS_ADMIN_LIST_PATH}?all=true`;

export const tagsAdminListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${TAGS_ADMIN_LIST_PATH}?${query.toString()}`;
};

export type NormalizedTagList = {
	results: TagsPaginatedResponse["results"];
	count: number;
	next: string | null;
	previous: string | null;
};

export const normalizeTagListResponse = (data: unknown): NormalizedTagList => {
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

	const page = data as Partial<TagsPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

export const fetchAllTags = async (): Promise<Tag[]> => {
	const tags: Tag[] = [];
	let page = 1;

	for (;;) {
		const data = await fetcher(TAGS_LIST_PATH, {
			page,
			per_page: 100,
		});
		const normalized = normalizeTagListResponse(data);
		tags.push(...normalized.results);

		if (!normalized.next) {
			break;
		}

		page += 1;
	}

	return tags;
};

export const useAllTags = () =>
	useSWR<Tag[]>(TAGS_LIST_PATH, fetchAllTags, { revalidateOnMount: true });

export const useAdminTags = (page: number, perPage: number = TAGS_PER_PAGE) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<TagsPaginatedResponse>(
		isLoggedIn && isAdmin ? tagsAdminListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useAdminTag = (pk: number | null) => {
	const detailPath =
		pk != null && Number.isFinite(pk) && pk > 0 ? tagAdminDetailPath(pk) : null;
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<Tag>(isLoggedIn && isAdmin ? detailPath : null, fetcher);
};

export const createTag = async (payload: TagCreatePayload): Promise<Tag> => {
	const { data } = await instanceAxios.post<Tag>(TAGS_ADMIN_LIST_PATH, payload);
	return data;
};

export const patchTag = async (
	pk: number,
	payload: TagUpdatePayload,
): Promise<Tag> => {
	const { data } = await instanceAxios.patch<Tag>(
		tagAdminDetailPath(pk),
		payload,
	);
	return data;
};

export const deleteTag = async (pk: number): Promise<void> => {
	await instanceAxios.delete(tagAdminDetailPath(pk));
};

export const revalidateTagLists = async () => {
	await mutate(
		(key) =>
			typeof key === "string" &&
			(key.startsWith(TAGS_ADMIN_LIST_PATH) || key.startsWith(TAGS_LIST_PATH)),
		undefined,
		{ revalidate: true },
	);
};

export const getTagApiErrorMessage = (error: unknown): string => {
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
