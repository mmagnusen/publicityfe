import useSWR from "swr";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

import {
	fetchReceivedApplication,
	type ReceivedApplication,
	type ReceivedApplicationsPaginatedResponse,
	receivedApplicationsListKey,
} from "@/lib/receivedApplications";

export const RECEIVED_APPLICATIONS_PER_PAGE = 20;

export const useReceivedApplications = (
	page: number,
	perPage: number = RECEIVED_APPLICATIONS_PER_PAGE,
) => {
	const { isLoggedIn } = useAuthenticatedUser();

	return useSWR<ReceivedApplicationsPaginatedResponse>(
		isLoggedIn ? receivedApplicationsListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useReceivedApplication = (pk: number | null) => {
	const { isLoggedIn } = useAuthenticatedUser();

	return useSWR<ReceivedApplication>(
		isLoggedIn && pk != null && Number.isFinite(pk) && pk > 0
			? ["received-application", pk]
			: null,
		() => fetchReceivedApplication(pk as number),
		{ revalidateOnMount: true },
	);
};

export type { ReceivedApplication } from "@/lib/receivedApplications";
export {
	fetchReceivedApplication,
	RECEIVED_APPLICATIONS_PATH,
	receivedApplicationsListKey,
} from "@/lib/receivedApplications";
