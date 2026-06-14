import useSWR from "swr";

import type {
	ReferralSignupDetail,
	RewardsReferralsResponse,
} from "@customTypes/rewards";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

/** Accepts `{ referrals }`, raw array, or DRF `{ results }`. */
const normalizeReferralsPayload = (raw: unknown): ReferralSignupDetail[] => {
	if (raw == null) return [];
	if (Array.isArray(raw)) return raw as ReferralSignupDetail[];
	if (typeof raw === "object") {
		const o = raw as Record<string, unknown>;
		if (Array.isArray(o.referrals)) {
			return o.referrals as ReferralSignupDetail[];
		}
		if (Array.isArray(o.results)) {
			return o.results as ReferralSignupDetail[];
		}
	}
	return [];
};

const fetchReferralsNormalized = async (
	url: string,
): Promise<RewardsReferralsResponse> => {
	const raw = await fetcher(url);
	return { referrals: normalizeReferralsPayload(raw) };
};

export const useRewardsReferrals = () => {
	const { isLoggedIn } = useAuthenticatedUser();
	return useSWR<RewardsReferralsResponse>(
		isLoggedIn ? "/rewards/referrals" : null,
		fetchReferralsNormalized,
	);
};
