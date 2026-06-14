import { render, renderHook, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	LIFETIME_SUBSCRIPTION_DURATION_MONTHS,
	useBilling,
} from "./useBilling";

const mockUseAuthenticatedUser = vi.fn();
const mockUseSWR = vi.fn();

const { reportError } = vi.hoisted(() => ({
	reportError: vi.fn(),
}));

vi.mock("swr", () => ({
	default: (key: unknown) => mockUseSWR(key),
}));

vi.mock("@hooks/useAuthenticatedUser", () => ({
	useAuthenticatedUser: () => mockUseAuthenticatedUser(),
}));

vi.mock("@hooks/useErrorReport", () => ({
	default: () => ({ reportError }),
	REPORT_POSTHOG_ONLY: {
		reportToLogsnag: false,
		reportToPosthog: true,
	},
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

vi.mock("@components/Button", () => ({
	default: ({
		children,
		isDisabled,
	}: {
		children: React.ReactNode;
		isDisabled?: boolean;
	}) => (
		<button type="button" disabled={Boolean(isDisabled)}>
			{children}
		</button>
	),
}));

vi.mock("@components/Tooltip", () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="tooltip">{children}</div>
	),
}));

const mockInstanceAxios = vi.fn();

vi.mock("@util/instanceAxios", () => ({
	instanceAxios: (...args: unknown[]) => mockInstanceAxios(...args),
}));

const authState = (
	overrides: {
		authenticatedUser?: unknown;
		hasActiveSubscription?: boolean;
		isLoggedIn?: boolean;
	} = {},
) => {
	return {
		authenticatedUser: null,
		hasActiveSubscription: false,
		isLoggedIn: false,
		...overrides,
	};
};

describe("useBilling", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAuthenticatedUser.mockReturnValue(authState());
		mockUseSWR.mockReturnValue({ data: undefined });
		mockInstanceAxios.mockResolvedValue({});
	});

	describe("hasLifetimeAccess", () => {
		it("is false when logged out", () => {
			const { result } = renderHook(() => useBilling());
			expect(result.current.hasLifetimeAccess).toBe(false);
		});

		it("is false when logged in but subscription status is missing", () => {
			mockUseAuthenticatedUser.mockReturnValue(authState({ isLoggedIn: true }));
			mockUseSWR.mockReturnValue({ data: undefined });
			const { result } = renderHook(() => useBilling());
			expect(result.current.hasLifetimeAccess).toBe(false);
		});

		it("is false when logged in with active subscription but duration is not lifetime", () => {
			mockUseAuthenticatedUser.mockReturnValue(authState({ isLoggedIn: true }));
			mockUseSWR.mockReturnValue({
				data: {
					has_active_subscription: true,
					subscription: {
						duration_months: LIFETIME_SUBSCRIPTION_DURATION_MONTHS - 1,
					},
				},
			});
			const { result } = renderHook(() => useBilling());
			expect(result.current.hasLifetimeAccess).toBe(false);
		});

		it("is true when logged in with active subscription and lifetime duration months", () => {
			mockUseAuthenticatedUser.mockReturnValue(authState({ isLoggedIn: true }));
			mockUseSWR.mockReturnValue({
				data: {
					has_active_subscription: true,
					subscription: {
						duration_months: LIFETIME_SUBSCRIPTION_DURATION_MONTHS,
					},
				},
			});
			const { result } = renderHook(() => useBilling());
			expect(result.current.hasLifetimeAccess).toBe(true);
		});
	});

	describe("mapPlanToPricingOption", () => {
		it("maps free plan (id 0) with expected copy and pricing", () => {
			const { result } = renderHook(() => useBilling());
			const option = result.current.mapPlanToPricingOption({ id: 0 });

			expect(option.id).toBe(0);
			expect(option.name).toBe("Free account");
			expect(option.price).toEqual({
				amount: 0,
				accessLength: "forever",
				inPence: 0,
			});
			expect(option.badge).toEqual({
				theme: "pink",
				label: "Free Forever",
			});
			expect(option.tagline).toBe("Perfect for casual browsers");
			expect(option.benefits).toEqual([
				"View all listings",
				"Post room wanted/offered listings",
				"Save favourite listings",
				"Daily email alerts for new rooms",
				"Create a rich profile",
			]);
		});

		it("maps paid plan (id 1) from API fields", () => {
			const { result } = renderHook(() => useBilling());
			const option = result.current.mapPlanToPricingOption({
				id: 1,
				name: "Premium monthly",
				price_pence: 1995,
				duration_months: 1,
			});

			expect(option.id).toBe(1);
			expect(option.name).toBe("Premium monthly");
			expect(option.price.amount).toBe(19.95);
			expect(option.price.inPence).toBe(1995);
			expect(option.price.accessLength).toBe("1 months access");
			expect(option.badge.label).toBe("Premium Access");
			expect(option.tagline).toBe(
				"Everything you need to find your perfect room/housemate",
			);
			expect(option.benefits).toContain(
				"Unlimited messages to anyone on Delphi",
			);
		});

		it("uses defaults for paid plan when optional fields are missing", () => {
			const { result } = renderHook(() => useBilling());
			const option = result.current.mapPlanToPricingOption({ id: 1 });

			expect(option.name).toBe("Paid account");
			expect(option.price.amount).toBe(0);
			expect(option.price.accessLength).toBe("0 months access");
		});

		it("maps unknown plan ids to the default branch", () => {
			const { result } = renderHook(() => useBilling());
			const option = result.current.mapPlanToPricingOption({
				id: 99,
				price_pence: 500,
			});

			expect(option.id).toBe(0);
			expect(option.benefits).toEqual([]);
			expect(option.badge.label).toBe("");
			expect(option.price.amount).toBe(5);
		});
	});

	describe("renderCTA (free plan)", () => {
		it("Logged out: shows register link", () => {
			const { result } = renderHook(() => useBilling());
			const { renderCTA } = result.current.mapPlanToPricingOption({ id: 0 });
			render(<>{renderCTA?.()}</>);

			const link = screen.getByRole("link", { name: /get free access/i });
			expect(link).toHaveAttribute("href", "/register");
		});

		it("logged in on free account: shows disabled CTA", () => {
			mockUseAuthenticatedUser.mockReturnValue(
				authState({ isLoggedIn: true, hasActiveSubscription: false }),
			);
			const { result } = renderHook(() => useBilling());
			const { renderCTA } = result.current.mapPlanToPricingOption({ id: 0 });
			render(<>{renderCTA?.()}</>);

			const label = screen.getByText(/^Choose plan$/);
			expect(label.closest("button")).toBeDisabled();
		});

		it("logged in with paid subscription (non-lifetime): shows disabled Choose plan CTA", () => {
			mockUseAuthenticatedUser.mockReturnValue(
				authState({ isLoggedIn: true, hasActiveSubscription: true }),
			);
			mockUseSWR.mockReturnValue({
				data: {
					has_active_subscription: true,
					subscription: { duration_months: 1 },
				},
			});
			const { result } = renderHook(() => useBilling());
			const { renderCTA } = result.current.mapPlanToPricingOption({ id: 0 });
			render(<>{renderCTA?.()}</>);

			const label = screen.getByText("Choose plan");
			expect(label.closest("button")).toBeDisabled();
		});

		it("when user has active subscription and lifetime access, shows choose plan CTA", () => {
			mockUseAuthenticatedUser.mockReturnValue(
				authState({ isLoggedIn: true, hasActiveSubscription: true }),
			);
			mockUseSWR.mockReturnValue({
				data: {
					has_active_subscription: true,
					subscription: {
						duration_months: LIFETIME_SUBSCRIPTION_DURATION_MONTHS,
					},
				},
			});
			const { result } = renderHook(() => useBilling());
			const { renderCTA } = result.current.mapPlanToPricingOption({ id: 0 });
			render(<>{renderCTA?.()}</>);

			const ctaButton = screen.getByText("Choose plan");
			expect(ctaButton).toBeInTheDocument();
			expect(ctaButton.closest("button")).toBeDisabled();
		});
	});

	describe("renderCTA (paid plan)", () => {
		it("shows register link with payment redirect when logged out", () => {
			const { result } = renderHook(() => useBilling());
			const { renderCTA } = result.current.mapPlanToPricingOption({ id: 1 });
			render(<>{renderCTA?.()}</>);

			const link = screen.getByRole("link", { name: /get premium access/i });
			expect(link).toHaveAttribute(
				"href",
				"/register?redirect_url=/pricing/payment/1",
			);
		});

		it("shows payment link when logged in without subscription", () => {
			mockUseAuthenticatedUser.mockReturnValue(
				authState({ isLoggedIn: true, hasActiveSubscription: false }),
			);
			const { result } = renderHook(() => useBilling());
			const { renderCTA } = result.current.mapPlanToPricingOption({ id: 1 });
			render(<>{renderCTA?.()}</>);

			const link = screen.getByRole("link", { name: /get premium access/i });
			expect(within(link).getByRole("button")).toBeEnabled();
			expect(link).toHaveAttribute("href", "/pricing/payment/1");
		});

		it("shows lifetime tooltip CTA when user has founding member access", () => {
			mockUseAuthenticatedUser.mockReturnValue(authState({ isLoggedIn: true }));
			mockUseSWR.mockReturnValue({
				data: {
					has_active_subscription: true,
					subscription: {
						duration_months: LIFETIME_SUBSCRIPTION_DURATION_MONTHS,
					},
				},
			});
			const { result } = renderHook(() => useBilling());
			const { renderCTA } = result.current.mapPlanToPricingOption({ id: 1 });
			render(<>{renderCTA?.()}</>);

			expect(screen.getByText("Choose plan")).toBeInTheDocument();
			expect(screen.getByText("Choose plan").closest("button")).toBeDisabled();
		});
	});

	describe("funcFetchSubscriptionHistory", () => {
		it("GETs subscription history", async () => {
			const { result } = renderHook(() => useBilling());
			await result.current.funcFetchSubscriptionHistory();

			expect(mockInstanceAxios).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "get",
					url: "/billing/subscription-history",
				}),
			);
		});

		it("reports errors to PostHog and rethrows", async () => {
			const err = new Error("network");
			mockInstanceAxios.mockRejectedValueOnce(err);

			const { result } = renderHook(() => useBilling());
			await expect(
				result.current.funcFetchSubscriptionHistory(),
			).rejects.toThrow("network");
			expect(reportError).toHaveBeenCalledWith(
				err,
				"funcFetchSubscriptionHistory",
				{
					reportToLogsnag: false,
					reportToPosthog: true,
				},
			);
		});
	});
});
