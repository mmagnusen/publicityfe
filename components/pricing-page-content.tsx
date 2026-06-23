"use client";

import Link from "next/link";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import { CtaSection } from "@/components/cta-section";
import Heading from "@/components/Heading";
import { Navigation } from "@/components/Navigation";
import { PricingPlans } from "@/components/pricing-section";
import Text from "@/components/Text";

export function PricingPageContent() {
	const { hasActiveSubscription, isLoggedIn } = useAuthenticatedUser();

	return (
		<div className="min-h-full bg-white font-sans">
			<Navigation isLoggedIn={isLoggedIn} />

			<main className="px-6 py-16 sm:py-24">
				<div className="mx-auto max-w-4xl">
					<div className="text-center">
						<Heading level={1} variant="page-lg">
							Simple, transparent pricing
						</Heading>
						<Text variant="page-subtitle" className="mx-auto mt-3 max-w-2xl">
							Start free. Upgrade when you&apos;re ready for unlimited matches,
							priority placement, and premium support.
						</Text>
					</div>

					{isLoggedIn && hasActiveSubscription ? (
						<p
							className="mx-auto mt-8 max-w-2xl rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-center text-sm text-violet-900"
							role="status"
						>
							You already have an active Premium subscription. Manage billing
							from your{" "}
							<Link className="font-semibold underline" href="/billing">
								billing page
							</Link>
							.
						</p>
					) : null}

					<div className="mt-12">
						<PricingPlans freeCtaHref="/register" />
					</div>

					<p className="mt-10 text-center text-sm text-gray-500">
						All plans include access to the public opportunity board. Cancel
						anytime — no hidden fees.
					</p>
				</div>
			</main>

			<CtaSection />
		</div>
	);
}
