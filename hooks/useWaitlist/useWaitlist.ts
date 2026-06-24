import useSWR from "swr";

import type { WaitlistEntriesPaginatedResponse } from "@customTypes/waitlist";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

export const WAITLIST_ADMIN_ENTRIES_PATH = "/waitlist/admin/entries";

export const WAITLIST_ENTRIES_PER_PAGE = 20;

export const waitlistAdminEntriesListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${WAITLIST_ADMIN_ENTRIES_PATH}?${query.toString()}`;
};

export type NormalizedWaitlistEntriesList = {
	results: WaitlistEntriesPaginatedResponse["results"];
	count: number;
	next: string | null;
	previous: string | null;
};

export const normalizeWaitlistEntriesResponse = (
	data: unknown,
): NormalizedWaitlistEntriesList => {
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

	const page = data as Partial<WaitlistEntriesPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

export const useAdminWaitlistEntries = (
	page: number,
	perPage: number = WAITLIST_ENTRIES_PER_PAGE,
) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<WaitlistEntriesPaginatedResponse>(
		isLoggedIn && isAdmin ? waitlistAdminEntriesListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};
