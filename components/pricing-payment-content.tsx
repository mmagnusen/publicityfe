"use client";

import { Suspense } from "react";
import Link from "next/link";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Heading from "@/components/Heading";
import { Navigation } from "@/components/Navigation";
import { PaymentCheckout } from "@/components/pages/Pricing/Payment/PaymentCheckout";
import Text from "@/components/Text";

type Props = {
	planId: string;
};

function PaymentPageInner({ planId }: Props) {
	return (
		<div className="mx-auto max-w-5xl">
			<Heading level={1} variant="page-lg">
				Complete your upgrade
			</Heading>
			<Text variant="page-subtitle" className="mt-2">
				Enter your details and pay securely to activate Pro.
			</Text>
			<div className="mt-8">
				<PaymentCheckout planId={planId} />
			</div>
			<p className="mt-8 text-sm text-gray-500">
				<Link className="font-semibold text-gray-900 underline" href="/pricing">
					← Back to pricing
				</Link>
			</p>
		</div>
	);
}

export function PricingPaymentContent({ planId }: Props) {
	const { isLoggedIn } = useAuthenticatedUser();

	return (
		<div className="min-h-full bg-gray-50 font-sans">
			<Navigation isLoggedIn={isLoggedIn} />
			<main className="px-6 py-16 sm:py-24">
				<Suspense fallback={<Text variant="loading">Loading checkout…</Text>}>
					<PaymentPageInner planId={planId} />
				</Suspense>
			</main>
		</div>
	);
}
