import { useCallback, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";

import Button from "@components/Button";
import { ctaButtonVariants } from "@components/pages/Pricing/Pricing/PricingCard/style";
import { type TagSkin } from "@components/Tag/Tag";
import Tooltip from "@components/Tooltip";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import { instanceAxios } from "@util/instanceAxios";

import fetcher from "@/util/fetcher";

/** Backend encodes lifetime premium as this duration (see billing UI). */
export const LIFETIME_SUBSCRIPTION_DURATION_MONTHS = 600;

export type Plan = {
	id: number;
	name: string;
	price_pence: number;
	duration_months: number;
};

export type Subscription = {
	start_date: string;
	end_date: string;
};

export type PricingOption = {
	id: number;
	name: string;
	price: {
		amount: number;
		accessLength: string;
		inPence: number;
	};
	renderCTA?: () => React.ReactNode;
	tagline: string;
	benefits: string[];
	badge: {
		theme: TagSkin;
		label: string;
	};
};

export const useBilling = () => {
	const { reportError } = useErrorReport({ functionNamePrefix: "useBilling" });
	const { authenticatedUser, hasActiveSubscription, isLoggedIn } =
		useAuthenticatedUser();
	const makeRequest = false;
	const { data: subscriptionStatusData } = useSWR(
		isLoggedIn && makeRequest ? "/billing/subscription-status" : null,
		fetcher,
	);

	const hasLifetimeAccess = useMemo(
		() =>
			Boolean(
				isLoggedIn &&
					subscriptionStatusData?.has_active_subscription &&
					subscriptionStatusData?.subscription?.duration_months ===
						LIFETIME_SUBSCRIPTION_DURATION_MONTHS,
			),
		[isLoggedIn, subscriptionStatusData],
	);

	/** Maps API `/billing/plans` rows to UI {@link PricingOption}. Uses auth when needed. */
	const mapPlanToPricingOption = useCallback(
		(plan: Partial<Plan> = {}): PricingOption => {
			switch (plan.id) {
				case 0:
					return {
						name: "Free account",
						price: {
							amount: 0,
							accessLength: "forever",
							inPence: 0,
						},
						id: 0,
						badge: {
							theme: "pink",
							label: "Free Forever",
						},
						tagline: "Perfect for casual browsers",
						benefits: [
							"View all listings",
							"Post room wanted/offered listings",
							"Save favourite listings",
							"Daily email alerts for new rooms",
							"Create a rich profile",
							"Verify your profile",
						],
						renderCTA: () => {
							if (!isLoggedIn) {
								return (
									<Link href="/register" passHref>
										<Button borderRadius="pill" isFullWidth>
											<span className={ctaButtonVariants()}>
												Get free access
											</span>
										</Button>
									</Link>
								);
							}

							if (isLoggedIn && hasActiveSubscription) {
								return (
									<Tooltip tooltipContent="You already have an active subscription">
										<Button borderRadius="pill" isFullWidth isDisabled>
											<span className={ctaButtonVariants()}>Choose plan</span>
										</Button>
									</Tooltip>
								);
							}

							if (isLoggedIn && !hasActiveSubscription) {
								return (
									<Tooltip tooltipContent="You are already on the free plan">
										<Button borderRadius="pill" isFullWidth isDisabled>
											<span className={ctaButtonVariants()}>Choose plan</span>
										</Button>
									</Tooltip>
								);
							}
							return null;
						},
					};
				case 1:
					return {
						id: 1,
						name: plan.name ?? "Paid account",
						price: {
							amount: (plan.price_pence ?? 0) / 100,
							accessLength: `${plan.duration_months ?? 0} months access`,
							inPence: plan.price_pence ?? 0,
						},
						tagline: "Everything you need to find your perfect room/housemate",
						benefits: [
							"View all listings",
							"Post room wanted/offered listings",
							"Save favourite listings",
							"Daily email alerts for new rooms",
							"Create a rich profile",
							"Verify your profile",
							"Unlimited messages to anyone on Delphi",
							"Your listings are reposted on instagram for extra visibility (optional)",
							"Priority customer support",
						],
						badge: {
							theme: "green",
							label: "Premium Access",
						},
						renderCTA: () => {
							if (!isLoggedIn) {
								return (
									<Link
										href={`/register?redirect_url=/pricing/payment/${plan.id}`}
										passHref
									>
										<Button borderRadius="pill" isFullWidth>
											<span className={ctaButtonVariants()}>
												Get premium access
											</span>
										</Button>
									</Link>
								);
							}

							if (isLoggedIn && hasLifetimeAccess) {
								return (
									<Tooltip tooltipContent="You have complimentary lifetime premium access">
										<Button borderRadius="pill" isFullWidth isDisabled>
											<span className={ctaButtonVariants()}>Choose plan</span>
										</Button>
									</Tooltip>
								);
							}

							if (isLoggedIn && hasActiveSubscription) {
								return (
									<Tooltip tooltipContent="You already have an active subscription">
										<Button borderRadius="pill" isFullWidth isDisabled>
											<span className={ctaButtonVariants()}>
												Your current subscription
											</span>
										</Button>
									</Tooltip>
								);
							}

							if (isLoggedIn && !hasActiveSubscription) {
								return (
									<Link href={`/pricing/payment/${plan.id}`} passHref>
										<Button borderRadius="pill" isFullWidth>
											<span className={ctaButtonVariants()}>
												Get premium access
											</span>
										</Button>
									</Link>
								);
							}
							return null;
						},
					};
				default:
					return {
						id: 0,
						name: "Free account",
						price: {
							amount: (plan.price_pence ?? 0) / 100,
							accessLength: "",
							inPence: 0,
						},
						tagline: "",
						benefits: [],
						badge: {
							theme: "green",
							label: "",
						},
						renderCTA: () => {
							if (!isLoggedIn) {
								return (
									<Link href="/register?redirect_url=/pricing/payment" passHref>
										<Button borderRadius="pill" isFullWidth>
											<span className={ctaButtonVariants()}>
												{hasLifetimeAccess ? "Choose plan" : "Get free access"}
											</span>
										</Button>
									</Link>
								);
							}

							if (isLoggedIn && hasActiveSubscription) {
								return (
									<Tooltip tooltipContent="You already have an active subscription">
										<Button borderRadius="pill" isFullWidth isDisabled>
											<span className={ctaButtonVariants()}>Choose plan</span>
										</Button>
									</Tooltip>
								);
							}

							if (isLoggedIn && !hasActiveSubscription) {
								return (
									<Tooltip tooltipContent="You are already on the free plan">
										<Button borderRadius="pill" isFullWidth isDisabled>
											<span className={ctaButtonVariants()}>
												{hasLifetimeAccess
													? "Choose plan"
													: "Your current plan"}
											</span>
										</Button>
									</Tooltip>
								);
							}
							return null;
						},
					};
			}
		},
		[authenticatedUser, hasActiveSubscription, hasLifetimeAccess, isLoggedIn],
	);

	const funcFetchSubscriptionHistory = async () => {
		try {
			await instanceAxios({
				method: "get",
				url: `/billing/subscription-history`,
				data: {},
			});
		} catch (error: any) {
			reportError(error, "funcFetchSubscriptionHistory", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	return {
		funcFetchSubscriptionHistory,
		hasLifetimeAccess,
		mapPlanToPricingOption,
	};
};
