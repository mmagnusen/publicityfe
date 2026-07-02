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
		src: "/creators/audience.jpg",
		alt: "Large audience seated in an auditorium",
	},
	{
		src: "/creators/studio.jpg",
		alt: "Professional recording studio with microphone and headphones",
	},
	{
		src: "/creators/camera.jpg",
		alt: "Professional video camera being operated",
	},
	{
		src: "/creators/panel.jpg",
		alt: "Panel discussion on stage with seated speakers",
	},
];

const benefits = [
	{
		title: "Verified Opportunities",
		description:
			"All opportunities are vetted to ensure quality and legitimacy",
	},
	{
		title: "Expert Support",
		description: "Dedicated media relations team to help you succeed",
	},
	{
		title: "No Commission Fees",
		description: "Keep 100% of your earnings from paid speaking opportunities",
	},
];

export function CreatorsSection() {
	return (
		<section className="bg-gray-50 px-6 py-20 sm:py-24">
			<div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
				<div className="grid grid-cols-2 gap-3 sm:gap-4">
					{images.map((image) => (
						<div
							key={image.src}
							className="relative aspect-4/3 overflow-hidden rounded-2xl"
						>
							<Image
								src={image.src}
								alt={image.alt}
								fill
								sizes="(max-width: 1024px) 45vw, 280px"
								className="object-cover"
							/>
						</div>
					))}
				</div>

				<div>
					<Heading level={2}>Built for Creators &amp; Businesses</Heading>
					<Text variant="section-lead-relaxed">
						Whether you&apos;re a solopreneur, startup founder, or established
						brand, ${TRADING_NAME} helps you build authority and reach your
						target audience through strategic media placements.
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
