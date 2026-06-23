/** GET /rewards/summary — authenticated */
export type RewardsSummary = {
	referral_code: string;
	/** Total referral credits ever earned, in pence. */
	lifetime_referral_credits_pence: number;
	signups_with_your_code: number;
	qualifying_upgrades_rewarded: number;
};

/**
 * One person who registered with your referral code.
 * GET /rewards/referrals — authenticated (see docs/frontend-rewards.md).
 */
export type ReferralSignupDetail = {
	referee_pk: number;
	referee_username: string;
	referee_first_name?: string | null;
	referee_last_name?: string | null;
	signed_up_at: string | null;
	/** Completed a qualifying paid upgrade (no promo on that purchase). */
	has_qualifying_paid_upgrade: boolean;
	/** Points credited to you for their qualifying upgrade (0 if none yet). */
	points_earned_for_upgrade: number;
	qualifying_upgrade_at: string | null;
};

/** Normalized shape after parsing GET /rewards/referrals (or DRF paginated list). */
export type RewardsReferralsResponse = {
	referrals: ReferralSignupDetail[];
};

/** GET /rewards/referral-activity — authenticated, paginated (DRF). */
export type ReferralActivityReferee = {
	display_name: string;
};

export type ReferralActivityItem = {
	referee: ReferralActivityReferee;
	signed_up_at: string;
	upgrade_completed_at: string | null;
	status: "pending" | "completed";
	referrer_points_awarded: number | null;
};

export type ReferralActivityPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ReferralActivityItem[];
};

/** GET /rewards/admin/referral-activity — JWT + staff only, CustomPagination (`page`, `per_page`). */
export type AdminReferralActivityReferrer = {
	id: number;
	email: string;
	display_name: string;
	referral_code: string;
};

export type AdminReferralActivityReferee = {
	id: number;
	email: string;
	display_name: string;
};

export type AdminReferralActivityRow = {
	referral_id: number;
	referrer: AdminReferralActivityReferrer;
	referee: AdminReferralActivityReferee;
	status: "pending" | "completed";
	signed_up_at: string;
	upgrade_completed_at: string | null;
	referrer_points: number | null;
	referee_points: number | null;
};

export type AdminReferralActivityPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: AdminReferralActivityRow[];
};
