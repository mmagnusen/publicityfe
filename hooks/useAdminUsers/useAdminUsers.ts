import useSWR from "swr";

import type { AdminUsersPaginatedResponse } from "@customTypes/adminUser";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

export const ADMIN_USER_SEARCH_PATH = "/users/admin-user-search";

export const ADMIN_USERS_PER_PAGE = 20;

export type NormalizedAdminUsersList = {
	results: AdminUsersPaginatedResponse["results"];
	count: number;
	next: string | null;
	previous: string | null;
};

export const normalizeAdminUsersResponse = (
	data: unknown,
): NormalizedAdminUsersList => {
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

	const page = data as Partial<AdminUsersPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

export const buildAdminUsersPageHref = (
	page: number,
	search = "",
	status = "",
): string => {
	const query = new URLSearchParams();
	if (page > 1) {
		query.set("page", String(page));
	}
	if (search.trim()) {
		query.set("q", search.trim());
	}
	if (status) {
		query.set("status", status);
	}
	const queryString = query.toString();
	return queryString ? `/admin/users?${queryString}` : "/admin/users";
};

export const useAdminUsers = (
	page: number,
	search = "",
	status = "",
	perPage: number = ADMIN_USERS_PER_PAGE,
) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<AdminUsersPaginatedResponse>(
		isLoggedIn && isAdmin
			? [ADMIN_USER_SEARCH_PATH, page, search, status, perPage]
			: null,
		([url, pageValue, searchValue, statusValue, perPageValue]) =>
			fetcher(url, {
				page: Number(pageValue) || 1,
				per_page: Number(perPageValue) || ADMIN_USERS_PER_PAGE,
				q: searchValue || undefined,
				status: statusValue || undefined,
			}),
		{ revalidateOnMount: true },
	);
};
