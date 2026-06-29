"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import useSWR from "swr";
import {
	mdiAccountGroupOutline,
	mdiContentCopy,
	mdiEmailOutline,
	mdiFacebook,
	mdiGiftOutline,
	mdiTrendingUp,
	mdiTwitter,
	mdiWhatsapp,
} from "@mdi/js";
import Icon from "@mdi/react";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";
import { cn } from "@/lib/cn";
import type { RewardsSummary } from "@/types/rewards";
import fetcher from "@/util/fetcher";

function formatReferralCredits(pence: number): string {
	return new Intl.NumberFormat("en-GB", {
		currency: "GBP",
		style: "currency",
	}).format(pence / 100);
}

type MetricCardProps = {
	icon: string;
	iconClassName: string;
	label: string;
	subtitle: string;
	value: string;
	valueClassName?: string;
};

function MetricCard({
	icon,
	iconClassName,
	label,
	subtitle,
	value,
	valueClassName,
}: MetricCardProps) {
	return (
		<div className="flex min-w-0 items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
			<span
				className={`inline-flex size-12 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
				aria-hidden
			>
				<Icon horizontal path={icon} rotate={180} size={1} vertical />
			</span>
			<div className="min-w-0">
				<p className="text-[0.9375rem] font-bold text-gray-900">{label}</p>
				<p className="text-[0.8125rem] font-medium text-gray-500">{subtitle}</p>
				<p
					className={`mt-1 text-xl font-bold leading-tight ${valueClassName ?? "text-gray-900"}`}
				>
					{value}
				</p>
			</div>
		</div>
	);
}

type Props = {
	className?: string;
	fallbackReferralCode?: string;
	isLoggedIn: boolean;
	showViewAllLink?: boolean;
};

export function DashboardReferralsSection({
	className,
	fallbackReferralCode = "",
	isLoggedIn,
	showViewAllLink = true,
}: Props) {
	const { data: summary, error: summaryError } = useSWR<RewardsSummary>(
		isLoggedIn ? "/rewards/summary" : null,
		fetcher,
	);

	const [shareBaseUrl, setShareBaseUrl] = useState("");

	useEffect(() => {
		setShareBaseUrl(
			typeof window !== "undefined" ? window.location.origin : "",
		);
	}, []);

	const referralCode =
		summary?.referral_code?.trim() || fallbackReferralCode.trim();
	const friendsReferred = summary?.signups_with_your_code ?? 0;
	const qualifyingUpgrades = summary?.qualifying_upgrades_rewarded ?? 0;
	const referralCreditsPence = summary?.lifetime_referral_credits_pence ?? 0;

	const inviteLink = useMemo(() => {
		if (!shareBaseUrl || !referralCode) {
			return "";
		}

		return `${shareBaseUrl}/register?invite=${encodeURIComponent(referralCode)}`;
	}, [referralCode, shareBaseUrl]);

	const mailtoHref = inviteLink
		? `mailto:?subject=${encodeURIComponent(`Join me on ${TRADING_NAME}`)}&body=${encodeURIComponent(`Use my referral link: ${inviteLink}`)}`
		: "#";
	const whatsappHref = inviteLink
		? `https://wa.me/?text=${encodeURIComponent(`Join me on ${TRADING_NAME}: ${inviteLink}`)}`
		: "#";
	const twitterHref = inviteLink
		? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on ${TRADING_NAME} ${inviteLink}`)}`
		: "#";
	const facebookHref = inviteLink
		? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`
		: "#";

	const copyInviteLink = async () => {
		if (!inviteLink) {
			return;
		}

		try {
			await navigator.clipboard.writeText(inviteLink);
			toast.success("Invite link copied");
		} catch {
			toast.error("Could not copy to clipboard");
		}
	};

	if (!referralCode) {
		return (
			<div
				className={cn(
					"mt-8 rounded-2xl border border-gray-200 bg-white p-6",
					className,
				)}
			>
				<Heading level={2} variant="subsection">
					Refer a friend
				</Heading>
				<Text variant="card-body" className="mt-2">
					Your referral code is not available yet. Try signing out and back in,
					or visit{" "}
					<Link
						className="font-semibold text-violet-700 underline"
						href="/referrals"
					>
						Referrals
					</Link>{" "}
					for more details.
				</Text>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"mt-8 rounded-2xl border border-gray-200 bg-white p-6",
				className,
			)}
		>
			{summaryError ? (
				<Text variant="error" className="mb-4">
					Unable to load referral stats. Your link is still available below.
				</Text>
			) : null}

			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex min-w-0 flex-1 gap-3">
					<span
						className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"
						aria-hidden
					>
						<Icon
							horizontal
							path={mdiGiftOutline}
							rotate={180}
							size={1}
							vertical
						/>
					</span>
					<div className="min-w-0">
						<Heading level={2} variant="subsection">
							Refer a friend
						</Heading>
						<p className="mt-1 max-w-xl text-[0.9375rem] leading-relaxed text-gray-500">
							Invite friends to join {TRADING_NAME} and earn referral credits
							when they upgrade.
						</p>
					</div>
				</div>
				{showViewAllLink ? (
					<Button href="/referrals" size="small" textTransform="none">
						View all referrals
					</Button>
				) : null}
			</div>

			<div className="mt-5 grid gap-3 sm:grid-cols-3">
				<MetricCard
					icon={mdiAccountGroupOutline}
					iconClassName="bg-blue-100 text-blue-600"
					label="Referrals"
					subtitle="Sign-ups with your code"
					value={String(friendsReferred)}
				/>
				<MetricCard
					icon={mdiTrendingUp}
					iconClassName="bg-green-100 text-green-600"
					label="Qualifying upgrades"
					subtitle="Qualifying upgrades rewarded"
					value={String(qualifyingUpgrades)}
				/>
				<MetricCard
					icon={mdiGiftOutline}
					iconClassName="bg-violet-100 text-violet-700"
					label="Referral credits"
					subtitle="Lifetime credits earned"
					value={formatReferralCredits(referralCreditsPence)}
					valueClassName="text-violet-600"
				/>
			</div>

			<div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
				<Heading level={3} variant="subsection-sm">
					Share your referral
				</Heading>

				<p className="mt-4 text-base font-semibold text-gray-500">
					Your referral link
				</p>
				<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
					<input
						readOnly
						aria-label="Your referral invite link"
						className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
						type="text"
						value={inviteLink}
					/>
					<Button
						isDisabled={!inviteLink}
						onClick={copyInviteLink}
						textTransform="none"
						type="button"
					>
						<span className="inline-flex items-center gap-2">
							<Icon
								horizontal
								path={mdiContentCopy}
								rotate={180}
								size={0.8}
								vertical
							/>
							Copy link
						</span>
					</Button>
				</div>

				<p className="mt-5 border-t border-gray-200 pt-4 text-base font-semibold text-gray-500">
					Share via
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					<a
						className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
						href={mailtoHref}
					>
						<Icon
							horizontal
							path={mdiEmailOutline}
							rotate={180}
							size={0.75}
							vertical
						/>
						Email
					</a>
					<a
						className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
						href={whatsappHref}
						rel="noreferrer"
						target="_blank"
					>
						<Icon
							horizontal
							path={mdiWhatsapp}
							rotate={180}
							size={0.75}
							vertical
						/>
						WhatsApp
					</a>
					<a
						className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
						href={twitterHref}
						rel="noreferrer"
						target="_blank"
					>
						<Icon
							horizontal
							path={mdiTwitter}
							rotate={180}
							size={0.75}
							vertical
						/>
						Twitter
					</a>
					<a
						className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
						href={facebookHref}
						rel="noreferrer"
						target="_blank"
					>
						<Icon
							horizontal
							path={mdiFacebook}
							rotate={180}
							size={0.75}
							vertical
						/>
						Facebook
					</a>
				</div>
			</div>
		</div>
	);
}
