"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mdiCreditCardOutline } from "@mdi/js";
import Icon from "@mdi/react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";

function BillingSkeletonCard({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) {
	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-6">
			<Heading level={2} variant="subsection">
				{title}
			</Heading>
			<div className="mt-4">{children}</div>
		</div>
	);
}

export function BillingContent() {
	const router = useRouter();
	const { authenticationChecked, hasActiveSubscription, isLoggedIn } =
		useAuthenticatedUser();

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	if (!authenticationChecked) {
		return (
			<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
				<Text variant="loading">Loading billing…</Text>
			</div>
		);
	}

	if (!isLoggedIn) {
		return null;
	}

	return (
		<SidebarLayout>
			<div className="flex items-center gap-3">
				<Icon
					className="shrink-0 text-gray-900"
					horizontal
					path={mdiCreditCardOutline}
					rotate={180}
					size={1.1}
					vertical
				/>
				<Heading level={1} variant="page-lg">
					Subscription &amp; Billing
				</Heading>
			</div>
			<Text variant="page-subtitle">
				Manage your plan, payment method, and invoices.
			</Text>

			<div className="mt-8 space-y-4">
				<BillingSkeletonCard title="Current plan">
					{hasActiveSubscription ? (
						<p className="text-[0.9375rem] leading-relaxed text-gray-600">
							You&apos;re on{" "}
							<strong className="font-semibold text-gray-900">Premium</strong>.
							Plan details and billing cycle will appear here.
						</p>
					) : (
						<>
							<p className="text-[0.9375rem] leading-relaxed text-gray-600">
								You&apos;re on the free plan. Upgrade to unlock premium
								features.
							</p>
							<div className="mt-4">
								<Button href="/pricing" textTransform="none">
									View pricing plans
								</Button>
							</div>
						</>
					)}
				</BillingSkeletonCard>

				<BillingSkeletonCard title="Payment method">
					<p className="text-[0.9375rem] leading-relaxed text-gray-600">
						Payment method management coming soon.
					</p>
				</BillingSkeletonCard>

				<BillingSkeletonCard title="Billing history">
					<p className="text-[0.9375rem] leading-relaxed text-gray-600">
						Invoices and receipts will appear here.
					</p>
				</BillingSkeletonCard>
			</div>

			<p className="mt-8 text-sm text-gray-500">
				Need help with billing?{" "}
				<Link
					className="font-semibold text-gray-900 underline"
					href="/dashboard"
				>
					Return to dashboard
				</Link>{" "}
				or contact support via live chat.
			</p>
		</SidebarLayout>
	);
}
