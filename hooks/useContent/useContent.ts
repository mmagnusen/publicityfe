import axios from "axios";
import useSWR, { mutate } from "swr";

import type {
	ContentBlock,
	ContentCreatePayload,
	ContentPaginatedResponse,
	ContentUpdatePayload,
} from "@customTypes/content";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";
import { instanceAxios } from "@util/instanceAxios";

export const CONTENT_BASE = "/content";

export const CONTENT_ADMIN_LIST_PATH = `${CONTENT_BASE}/admin/content`;

export const contentAdminDetailPath = (pk: number) =>
	`${CONTENT_BASE}/update-content/${pk}`;

export const contentBySlugPath = (slug: string) =>
	`${CONTENT_BASE}/fetch-content/${encodeURIComponent(slug.trim())}`;

export const CONTENT_PER_PAGE = 20;

/** Suggested slug for the editable profile bio starter template. */
export const PROFILE_BIO_TEMPLATE_SLUG = "profile-bio-template";

export const contentAdminListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${CONTENT_ADMIN_LIST_PATH}?${query.toString()}`;
};

export type NormalizedContentList = {
	results: ContentPaginatedResponse["results"];
	count: number;
	next: string | null;
	previous: string | null;
};

export const normalizeContentListResponse = (
	data: unknown,
): NormalizedContentList => {
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

	const page = data as Partial<ContentPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

export const useAdminContentList = (
	page: number,
	perPage: number = CONTENT_PER_PAGE,
) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<ContentPaginatedResponse>(
		isLoggedIn && isAdmin ? contentAdminListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useAdminContent = (pk: number | null) => {
	const detailPath =
		pk != null && Number.isFinite(pk) && pk > 0
			? contentAdminDetailPath(pk)
			: null;
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<ContentBlock>(
		isLoggedIn && isAdmin ? detailPath : null,
		fetcher,
	);
};

export const useContentBySlug = (slug: string | null | undefined) => {
	const trimmed = slug?.trim() ?? "";

	return useSWR<ContentBlock>(
		trimmed ? contentBySlugPath(trimmed) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const createContent = async (
	payload: ContentCreatePayload,
): Promise<ContentBlock> => {
	const { data } = await instanceAxios.post<ContentBlock>(
		CONTENT_ADMIN_LIST_PATH,
		payload,
	);
	return data;
};

export const patchContent = async (
	pk: number,
	payload: ContentUpdatePayload,
): Promise<ContentBlock> => {
	const { data } = await instanceAxios.patch<ContentBlock>(
		contentAdminDetailPath(pk),
		payload,
	);
	return data;
};

export const deleteContent = async (pk: number): Promise<void> => {
	await instanceAxios.delete(contentAdminDetailPath(pk));
};

export const revalidateContentLists = async () => {
	await mutate(
		(key) =>
			typeof key === "string" &&
			(key.startsWith(CONTENT_ADMIN_LIST_PATH) ||
				key.startsWith(`${CONTENT_BASE}/fetch-content/`)),
		undefined,
		{ revalidate: true },
	);
};

export const getContentApiErrorMessage = (error: unknown): string => {
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
