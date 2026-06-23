"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { Navigation } from "@/components/Navigation";
import Text from "@/components/Text";

export function PricingConfirmationContent() {
	const searchParams = useSearchParams();
	const { isLoggedIn } = useAuthenticatedUser();
	const redirectStatus = searchParams.get("redirect_status");
	const succeeded = redirectStatus === "succeeded";

	return (
		<div className="min-h-full bg-gray-50 font-sans">
			<Navigation isLoggedIn={isLoggedIn} />

			<main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
				<div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
					<span
						className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700"
						aria-hidden
					>
						<Icon horizontal path={mdiCheck} rotate={180} size={1.2} vertical />
					</span>
					<Heading level={1} variant="page-lg" className="mt-4">
						{succeeded ? "Payment confirmed" : "Payment status"}
					</Heading>
					<Text variant="page-subtitle" className="mx-auto mt-3 max-w-lg">
						{succeeded
							? "Your payment has been confirmed. Please check your email for your receipt. You can now access full premium features."
							: "We couldn't confirm your payment status. If you completed checkout, check your email for a receipt or contact support."}
					</Text>
					<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
						<Button
							href={isLoggedIn ? "/dashboard" : "/login"}
							textTransform="none"
						>
							{isLoggedIn ? "Go to dashboard" : "Sign in"}
						</Button>
						<Button
							href="/pricing"
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							Back to pricing
						</Button>
					</div>
					<p className="mt-6 text-sm text-gray-500">
						Need help?{" "}
						<Link
							className="font-semibold text-gray-900 underline"
							href="/dashboard"
						>
							Contact support
						</Link>
						.
					</p>
				</div>
			</main>
		</div>
	);
}
