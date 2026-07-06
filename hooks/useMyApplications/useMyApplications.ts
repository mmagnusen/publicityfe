import useSWR from "swr";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

import {
	MY_APPLICATIONS_PATH,
	type MyApplicationsPaginatedResponse,
	myApplicationsListKey,
} from "@/lib/applications";

export const MY_APPLICATIONS_PER_PAGE = 20;

export const useMyApplications = (
	page: number,
	perPage: number = MY_APPLICATIONS_PER_PAGE,
) => {
	const { isLoggedIn } = useAuthenticatedUser();

	return useSWR<MyApplicationsPaginatedResponse>(
		isLoggedIn ? myApplicationsListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export type { MyApplication } from "@/lib/applications";
export {
	MY_APPLICATIONS_PATH,
	myApplicationsListKey,
} from "@/lib/applications";
