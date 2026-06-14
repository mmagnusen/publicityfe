import useSWR from "swr";

import type { ReferralActivityPaginatedResponse } from "@customTypes/rewards";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

export const REFERRAL_ACTIVITY_PAGE_SIZE = 10;

export const referralActivityListKey = (page: number) => {
	const q = new URLSearchParams({
		page: String(page),
		page_size: String(REFERRAL_ACTIVITY_PAGE_SIZE),
	});
	return `/rewards/referral-activity?${q.toString()}`;
};

export const useReferralActivity = (page = 1) => {
	const { isLoggedIn } = useAuthenticatedUser();
	return useSWR<ReferralActivityPaginatedResponse>(
		isLoggedIn ? referralActivityListKey(page) : null,
		fetcher,
	);
};
