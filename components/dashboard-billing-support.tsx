"use client";

import { Crisp } from "crisp-sdk-web";
import Link from "next/link";
import { mdiChat, mdiCreditCardOutline } from "@mdi/js";
import Icon from "@mdi/react";

import { useCrispChatWidget } from "@hooks/useCrispChatWidget";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { TRADING_NAME } from "@/constants/tradingName";

type Props = {
	hasActiveSubscription: boolean;
};

export function DashboardBillingSupport({ hasActiveSubscription }: Props) {
	useCrispChatWidget();

	const openLiveChat = () => {
		if (process.env.NEXT_PUBLIC_CRISP_WEBSITE) {
			Crisp.chat.open();
		}
	};

	return (
		<div className="mt-8 space-y-4">
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<div className="flex items-center gap-3">
					<Icon
						className="shrink-0 text-gray-900"
						horizontal
						path={mdiCreditCardOutline}
						rotate={180}
						size={1}
						vertical
					/>
					<Heading level={2} variant="subsection">
						Subscription &amp; Billing
					</Heading>
				</div>

				{hasActiveSubscription ? (
					<div className="mt-4">
						<p className="max-w-2xl text-[0.9375rem] leading-relaxed text-gray-600">
							You&apos;re on{" "}
							<strong className="font-semibold text-gray-900">Premium</strong>.
							Manage your plan, payment method, and invoices anytime.
						</p>
						<div className="mt-4">
							<Button href="/billing" textTransform="none">
								Manage billing
							</Button>
						</div>
					</div>
				) : (
					<div className="mt-4">
						<p className="max-w-2xl text-[0.9375rem] leading-relaxed text-gray-600">
							Upgrade your account to access priority placement, smart matching,
							and more.
						</p>
						<div className="mt-4 flex flex-wrap items-center gap-4">
							<Button href="/pricing" textTransform="none">
								View pricing plans
							</Button>
							<Link
								className="text-sm font-semibold text-gray-900 underline underline-offset-2"
								href="/billing"
							>
								Billing &amp; receipts →
							</Link>
						</div>
					</div>
				)}
			</div>

			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
					<span
						className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700"
						aria-hidden
					>
						<Icon horizontal path={mdiChat} rotate={180} size={1.25} vertical />
					</span>
					<div className="min-w-0">
						<Heading level={2} variant="subsection">
							Need help? Chat with us
						</Heading>
						<p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-gray-600">
							Our support team is here to help you with any questions about your
							account, opportunities, or getting started on ${TRADING_NAME}.
						</p>
						<div className="mt-4">
							<Button onClick={openLiveChat} textTransform="none" type="button">
								<span className="inline-flex items-center gap-2">
									<Icon
										horizontal
										path={mdiChat}
										rotate={180}
										size={0.85}
										vertical
									/>
									Start live chat
								</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
