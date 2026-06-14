import useSWR from "swr";

import type { AdminReferralActivityPaginatedResponse } from "@customTypes/rewards";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

export const ADMIN_REFERRAL_ACTIVITY_PER_PAGE = 25;

export const adminReferralActivityListKey = (page: number) => {
	const q = new URLSearchParams({
		page: String(page),
		per_page: String(ADMIN_REFERRAL_ACTIVITY_PER_PAGE),
	});
	return `/rewards/admin/referral-activity?${q.toString()}`;
};

export const useAdminReferralActivity = (page: number) => {
	const { isLoggedIn, isAdmin } = useAuthenticatedUser();
	return useSWR<AdminReferralActivityPaginatedResponse>(
		isLoggedIn && isAdmin ? adminReferralActivityListKey(page) : null,
		fetcher,
	);
};
