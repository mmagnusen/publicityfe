"use client";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import Tooltip from "@/components/Tooltip";
import { TRADING_NAME } from "@/constants/tradingName";
import { buildProPlanCtaHref, DEFAULT_PAID_PLAN_ID } from "@/lib/pricing";

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className={`size-4 shrink-0 ${className ?? ""}`}
			aria-hidden
		>
			<title>Included</title>
			<path
				d="M3.5 8.5L6.5 11.5L12.5 4.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ArrowIcon() {
	return (
		<svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
			<title>Arrow right</title>
			<path
				d="M3 8h10M9 4l4 4-4 4"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

const freeFeatures = [
	"Up to 5 opportunity matches/month",
	"Basic profile page",
	"Email alerts for new matches",
	"Access to public opportunity board",
	"Community forum access",
];

const proFeatures = [
	"Unlimited opportunity matches",
	"AI-powered smart matching",
	"Priority profile placement",
	"Real-time instant alerts",
	"Analytics & visibility dashboard",
	"Dedicated media relations support",
	"No commission on paid opportunities",
];

type PricingPlansProps = {
	freeCtaHref?: string;
};

export function PricingPlans({ freeCtaHref = "/register" }: PricingPlansProps) {
	const { hasActiveSubscription, isLoggedIn } = useAuthenticatedUser();
	const proCtaHref = buildProPlanCtaHref(isLoggedIn, DEFAULT_PAID_PLAN_ID);

	const proButton = hasActiveSubscription ? (
		<Tooltip tooltipContent="You already have an active subscription">
			<Button
				borderRadius="pill"
				isDisabled
				isFullWidth
				strVariant="white"
				textTransform="none"
			>
				Your current plan
			</Button>
		</Tooltip>
	) : (
		<Button
			borderRadius="pill"
			href={proCtaHref}
			isFullWidth
			strVariant="white"
			textTransform="none"
		>
			<span className="inline-flex items-center justify-center gap-2">
				Get Pro access
				<ArrowIcon />
			</span>
		</Button>
	);

	return (
		<div className="grid gap-6 md:grid-cols-2 md:gap-8">
			<article className="flex flex-col rounded-3xl border border-gray-200 p-8 sm:p-10">
				<Text variant="eyebrow">Free</Text>

				<div className="mt-4 flex items-baseline gap-1">
					<span className="text-4xl font-bold text-black">$0</span>
					<span className="text-sm text-gray-400">/month</span>
				</div>

				<Text variant="plan-description">
					Everything you need to get started and explore opportunities.
				</Text>

				<ul className="mt-8 flex flex-1 flex-col gap-3">
					{freeFeatures.map((feature) => (
						<li
							key={feature}
							className="flex items-start gap-3 text-sm text-gray-700"
						>
							<CheckIcon className="mt-0.5 text-green-500" />
							{feature}
						</li>
					))}
				</ul>

				<Button
					href={freeCtaHref}
					borderRadius="pill"
					isFullWidth
					strVariant="transparentWithBorder"
					textTransform="none"
					className="mt-10"
				>
					Get started for free
				</Button>
			</article>

			<article className="relative flex flex-col overflow-hidden rounded-3xl bg-black p-8 sm:p-10">
				<div
					className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-violet-600/30 blur-3xl"
					aria-hidden
				/>

				<div className="relative flex items-center justify-between">
					<Text variant="eyebrow">Pro</Text>
					<span className="rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
						Most popular
					</span>
				</div>

				<div className="relative mt-4 flex items-baseline gap-1">
					<span className="text-4xl font-bold text-white">$19.99</span>
					<span className="text-sm text-gray-400">/month</span>
				</div>

				<Text variant="plan-description-muted">
					Full access to everything ${TRADING_NAME} has to offer.
				</Text>

				<ul className="relative mt-8 flex flex-1 flex-col gap-3">
					{proFeatures.map((feature) => (
						<li
							key={feature}
							className="flex items-start gap-3 text-sm text-white"
						>
							<CheckIcon className="mt-0.5 text-violet-400" />
							{feature}
						</li>
					))}
				</ul>

				<div className="relative mt-10">{proButton}</div>
			</article>
		</div>
	);
}

export function PricingSection() {
	return (
		<section id="pricing" className="bg-[#FAF8F4] px-6 py-20 sm:py-24">
			<div className="mx-auto max-w-4xl">
				<div className="text-center">
					<Heading level={2}>Simple, transparent pricing</Heading>
					<Text variant="section-lead">
						Start free. Upgrade when you&apos;re ready.
					</Text>
				</div>

				<div className="mt-12">
					<PricingPlans />
				</div>
			</div>
		</section>
	);
}
