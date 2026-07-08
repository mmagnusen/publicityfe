"use client";

import { useState } from "react";

import Heading from "@/components/Heading";
import { ProfilePageMockup } from "@/components/profile-page-mockup";
import Text from "@/components/Text";
import { cn } from "@/lib/cn";

const steps = [
	{
		title: "Create your profile",
		description:
			"Your profile is your media CV. Add your expertise, background, industry, social links and any previous press coverage — so journalists already know you're the right fit.",
	},
	{
		title: "Browse opportunities",
		description:
			"Every day, new opportunities land on the platform from journalists, podcast hosts, editors and event organisers actively looking for experts like you.",
	},
	{
		title: "Pitch and get featured",
		description:
			"Found an opportunity that fits? Send your pitch in minutes. If selected, you'll hear directly from the outlet — and your next feature begins.",
	},
];

function StepIcon({ isActive }: { isActive: boolean }) {
	if (isActive) {
		return (
			<span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
				<svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
					<path
						d="M4 8.5 6.5 11 12 5"
						stroke="currentColor"
						strokeWidth="1.75"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
		);
	}

	return (
		<span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white" />
	);
}

type StepItemProps = {
	description: string;
	isActive: boolean;
	isLast: boolean;
	onSelect: () => void;
	title: string;
};

function StepItem({
	description,
	isActive,
	isLast,
	onSelect,
	title,
}: StepItemProps) {
	return (
		<li className="relative flex gap-4">
			{!isLast ? (
				<span
					aria-hidden
					className="absolute top-8 left-4 h-[calc(100%-0.5rem)] w-px -translate-x-1/2 bg-gray-200"
				/>
			) : null}
			<StepIcon isActive={isActive} />
			<button
				className="min-w-0 flex-1 pb-8 text-left last:pb-0"
				onClick={onSelect}
				type="button"
			>
				<Heading
					level={3}
					variant="subsection"
					className={cn(
						"transition-colors",
						isActive ? "text-black" : "text-gray-400",
					)}
				>
					{title}
				</Heading>
				<Text
					variant="card-body"
					className={cn(
						"mt-1 max-w-md transition-colors",
						isActive ? "text-gray-500" : "text-gray-400",
					)}
				>
					{description}
				</Text>
			</button>
		</li>
	);
}

export function HowItWorksSection() {
	const [activeStep, setActiveStep] = useState(0);

	return (
		<section id="how-it-works" className="bg-white px-6 py-20 sm:py-24">
			<div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
				<div>
					<Heading level={2}>
						Getting press coverage is as easy as 3 steps
					</Heading>
					<Text variant="section-lead-relaxed" className="mt-4 max-w-lg">
						Get started in minutes and start landing opportunities today. Build
						a profile journalists trust, then pitch with confidence.
					</Text>

					<ol className="mt-10">
						{steps.map((step, index) => (
							<StepItem
								key={step.title}
								description={step.description}
								isActive={activeStep === index}
								isLast={index === steps.length - 1}
								onSelect={() => setActiveStep(index)}
								title={step.title}
							/>
						))}
					</ol>
				</div>

				<div className="lg:pl-4">
					<ProfilePageMockup />
				</div>
			</div>
		</section>
	);
}
