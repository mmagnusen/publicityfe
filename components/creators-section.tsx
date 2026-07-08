import Image from "next/image";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

function CheckIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-4 shrink-0"
			aria-hidden
		>
			<title>Included</title>
			<circle cx="8" cy="8" r="8" className="fill-green-500" />
			<path
				d="M5 8l2 2 4-4"
				stroke="white"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

const images = [
	{
		src: "/creators/cosmo.png",
		alt: "Cosmopolitan magazine cover featuring Maisie Peters",
		imageClassName: "object-cover object-top",
	},
	{
		src: "/creators/media-interview.png",
		alt: "Woman being interviewed on camera in a studio with bookshelves",
	},
	{
		src: "/creators/podcast-studio.png",
		alt: "Man wearing headphones recording a podcast in a professional studio",
	},
	{
		src: "/creators/house-and-garden-cover.png",
		alt: "House & Garden magazine cover featuring a luxurious living room interior",
	},
] as const;

const masonryColumns = [
	images.filter((_, index) => index % 2 === 0),
	images.filter((_, index) => index % 2 === 1),
] as const;

const benefits = [
	{
		title: "Vetted Opportunities",
		description:
			"Every opportunity on the platform is vetted before it goes live - so you're only pitching to real journalists, genuine podcast hosts and legitimate event organisers.",
	},
	{
		title: "Simple, Flat Pricing",
		description:
			"One monthly subscription. No commission, no hidden fees, no percentage taken from speaking fees or deals. What you earn is yours.",
	},
	{
		title: "New Opportunities Every Day",
		description:
			"Fresh press, podcast, panel and speaking opportunities added regularly - so there's always something worth pitching for, whatever your industry.",
	},
];

export function CreatorsSection() {
	return (
		<section className="bg-gray-50 px-6 py-20 sm:py-24">
			<div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
				<div className="grid grid-cols-2 gap-3 sm:gap-4">
					{masonryColumns.map((column, columnIndex) => (
						<div
							key={columnIndex === 0 ? "left" : "right"}
							className={`flex flex-col gap-3 sm:gap-4 ${columnIndex === 1 ? "pt-8 sm:pt-12" : ""}`}
						>
							{column.map((image) => (
								<div
									key={image.src}
									className="relative aspect-square overflow-hidden rounded-2xl"
								>
									<Image
										src={image.src}
										alt={image.alt}
										fill
										sizes="(max-width: 1024px) 45vw, 280px"
										className={
											"imageClassName" in image && image.imageClassName
												? image.imageClassName
												: "object-cover"
										}
									/>
								</div>
							))}
						</div>
					))}
				</div>

				<div>
					<Heading level={2}>
						You&apos;ve built something great. Let&apos;s make sure people know.
					</Heading>
					<Text variant="section-lead-relaxed">
						Whether you&apos;re a founder, freelancer, creative, consultant or
						expert in your field - {TRADING_NAME} helps you build your profile,
						grow your authority and get in front of the right audiences.
					</Text>

					<ul className="mt-8 space-y-5">
						{benefits.map((benefit) => (
							<li key={benefit.title} className="flex gap-3">
								<CheckIcon />
								<div>
									<Text variant="benefit-title">{benefit.title}</Text>
									<Text variant="benefit-description">
										{benefit.description}
									</Text>
								</div>
							</li>
						))}
					</ul>

					<Button href="/register" textTransform="none" className="mt-8">
						Get Started
					</Button>
				</div>
			</div>
		</section>
	);
}
