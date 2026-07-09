import Heading from "@/components/Heading";
import { ProfilePageMockup } from "@/components/profile-page-mockup";
import Text from "@/components/Text";
import { cn } from "@/lib/cn";

const steps = [
	{
		title: "Create your profile",
		description:
			"Your profile is your media CV. Add your expertise, background, industry, social links and any previous press coverage - so journalists already know you're the right fit.",
	},
	{
		title: "Browse opportunities",
		description:
			"Every day, new opportunities land on the platform from journalists, podcast hosts, editors and event organisers actively looking for experts like you.",
	},
	{
		title: "Pitch and get featured",
		description:
			"Send a tailored pitch in minutes. No cold emails, no chasing, no agency needed. Just you, your story, and a direct line to the people who want to tell it.s",
	},
];

function StepIcon({ number }: { number: number }) {
	return (
		<span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
			{number}
		</span>
	);
}

type StepItemProps = {
	description: string;
	index: number;
	isLast: boolean;
	title: string;
};

function StepItem({ description, index, isLast, title }: StepItemProps) {
	return (
		<li className={cn("relative flex gap-4", !isLast && "pb-8 sm:pb-10")}>
			{!isLast ? (
				<span
					aria-hidden
					className="absolute top-8 left-4 bottom-0 w-px -translate-x-1/2 bg-gray-200"
				/>
			) : null}
			<StepIcon number={index + 1} />
			<div className="min-w-0 flex-1">
				<Heading level={3} variant="subsection">
					{title}
				</Heading>
				<Text variant="card-body" className="mt-1 max-w-md">
					{description}
				</Text>
			</div>
		</li>
	);
}

export function HowItWorksSection() {
	return (
		<section id="how-it-works" className="bg-white px-6 py-20 sm:py-24">
			<div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
				<div>
					<Heading level={2}>
						Getting press coverage is as easy as 3 steps
					</Heading>
					<Text variant="section-lead-relaxed" className="mt-4 max-w-lg">
						Get started in minutes and start getting media coverage today. Build
						a profile journalists trust, then pitch with confidence.
					</Text>

					<ol className="mt-10">
						{steps.map((step, index) => (
							<StepItem
								key={step.title}
								description={step.description}
								index={index}
								isLast={index === steps.length - 1}
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
