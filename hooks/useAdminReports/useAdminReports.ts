import useSWR from "swr";

import type { AdminReportsPaginatedResponse } from "@customTypes/adminReports";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

export const ADMIN_REPORTS_PER_PAGE = 20;

export const adminReportsListKey = (page: number, perPage: number) => {
	const q = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `/reports/fetch-admin-reports?${q.toString()}`;
};

export const useAdminReports = (
	page: number,
	perPage: number = ADMIN_REPORTS_PER_PAGE,
) => {
	const { isLoggedIn, isAdmin } = useAuthenticatedUser();
	return useSWR<AdminReportsPaginatedResponse>(
		isLoggedIn && isAdmin ? adminReportsListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};
