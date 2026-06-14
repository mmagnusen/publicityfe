import useSWR from "swr";

import type { AdminReportDetail } from "@customTypes/adminReports";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

export const adminReportDetailKey = (pk: number) => `/reports/report/${pk}`;

export const useAdminReport = (pk: number | null) => {
	const { isLoggedIn, isAdmin } = useAuthenticatedUser();
	return useSWR<AdminReportDetail>(
		isLoggedIn && isAdmin && pk != null ? adminReportDetailKey(pk) : null,
		fetcher,
	);
};
