"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { type PricingOption, useBilling } from "@hooks/useBilling";
import { resolvePromoCodeForRegistration } from "@hooks/usePromoCode";

import { PaymentForm } from "@/components/pages/Pricing/Payment/PaymentForm";
import Text from "@/components/Text";
import fetcher from "@/util/fetcher";

const stripePromise = loadStripe(
	String(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""),
);

type Props = {
	planId: string;
};

export function PaymentCheckout({ planId }: Props) {
	const searchParams = useSearchParams();
	const { mapPlanToPricingOption } = useBilling();
	const {
		data: plan,
		error,
		isLoading,
	} = useSWR(planId ? `/billing/plans/${planId}` : null, fetcher);

	const pricingOption: PricingOption | undefined = plan
		? mapPlanToPricingOption(plan)
		: undefined;
	const amountPence = plan?.price_pence;
	const [promoAdjustedPence, setPromoAdjustedPence] = useState<number | null>(
		null,
	);

	useEffect(() => {
		setPromoAdjustedPence(null);
	}, [planId]);

	const chargeAmountPence = promoAdjustedPence ?? amountPence ?? 0;
	const prefillPromoCode =
		resolvePromoCodeForRegistration(
			Object.fromEntries(searchParams.entries()),
		) ?? "";

	if (isLoading) {
		return <Text variant="loading">Loading plan…</Text>;
	}

	if (error || plan == null || pricingOption == null || amountPence == null) {
		return (
			<Text variant="error">
				We couldn&apos;t load this plan. Please go back to pricing and try
				again.
			</Text>
		);
	}

	if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
		return (
			<Text variant="error">
				Payments are not configured yet. Please try again later.
			</Text>
		);
	}

	return (
		<Elements
			key={plan.id}
			options={{
				amount: chargeAmountPence,
				currency: "gbp",
				mode: "payment",
			}}
			stripe={stripePromise}
		>
			<PaymentForm
				baseAmountPence={amountPence}
				chargeAmountPence={chargeAmountPence}
				planNumericId={plan.id}
				prefillPromoCode={prefillPromoCode}
				pricingOption={pricingOption}
				setPromoAdjustedPence={setPromoAdjustedPence}
			/>
		</Elements>
	);
}
