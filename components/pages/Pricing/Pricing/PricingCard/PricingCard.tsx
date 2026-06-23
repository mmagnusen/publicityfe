"use client";

import Link from "next/link";
import { mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";

import { type PricingOption } from "@hooks/useBilling";

import Tag from "@/components/Tag/Tag";
import priceConverter from "@/util/priceConverter";

export type PromoPriceRow = {
	listPence: number;
	payablePence: number;
};

type Props = PricingOption & {
	children?: React.ReactNode;
	promoPriceRow?: PromoPriceRow | null;
	showCTA?: boolean;
};

export function PricingCard({
	badge,
	benefits,
	children,
	name,
	price,
	promoPriceRow = null,
	renderCTA,
	showCTA = true,
	tagline,
}: Props) {
	const showStruckOriginal =
		promoPriceRow != null &&
		promoPriceRow.listPence !== promoPriceRow.payablePence;

	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-6">
			<Tag skin={badge.theme}>{badge.label}</Tag>
			<h3 className="mt-3 text-xl font-bold text-gray-900">{name}</h3>
			<div className="mt-2 text-3xl font-bold text-gray-900">
				{promoPriceRow ? (
					<>
						<span className="inline-flex flex-wrap items-baseline gap-2">
							{showStruckOriginal ? (
								<span className="text-lg font-semibold text-gray-400 line-through">
									{priceConverter({
										currency: "£",
										price: promoPriceRow.listPence,
									})}
								</span>
							) : null}
							<span>
								{priceConverter({
									currency: "£",
									price: promoPriceRow.payablePence,
								})}
							</span>
						</span>
						<span className="ml-2 text-sm font-medium text-gray-500">
							{price.accessLength}
						</span>
					</>
				) : (
					<>
						£{price.amount.toFixed(2)}
						<span className="ml-2 text-sm font-medium text-gray-500">
							{price.accessLength}
						</span>
					</>
				)}
			</div>
			<p className="mt-3 text-sm text-gray-600">{tagline}</p>
			<ul className="mt-5 space-y-2">
				{benefits.map((benefit) => (
					<li
						key={benefit}
						className="flex items-start gap-2 text-sm text-gray-700"
					>
						<span
							className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full ${
								badge.theme === "pink" ? "bg-pink-100" : "bg-green-100"
							}`}
							aria-hidden
						>
							<Icon
								color={badge.theme === "pink" ? "#e60076" : "#00a63e"}
								horizontal
								path={mdiCheck}
								rotate={180}
								size={0.65}
								vertical
							/>
						</span>
						{benefit}
					</li>
				))}
			</ul>
			{children}
			{showCTA ? <div className="mt-6">{renderCTA?.()}</div> : null}
		</div>
	);
}

export function PaymentPlanSummary({
	pricingOption,
	promoPriceRow,
}: {
	pricingOption: PricingOption;
	promoPriceRow?: PromoPriceRow | null;
}) {
	return (
		<PricingCard
			{...pricingOption}
			promoPriceRow={promoPriceRow}
			showCTA={false}
		>
			<p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-center text-sm text-gray-700">
				Secure payments powered by{" "}
				<Link
					className="font-semibold text-gray-900 underline"
					href="https://stripe.com/gb"
					rel="noreferrer"
					target="_blank"
				>
					Stripe
				</Link>
			</p>
		</PricingCard>
	);
}
