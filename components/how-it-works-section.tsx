import Heading from "@/components/Heading";
import Text from "@/components/Text";

const steps = [
	{
		number: 1,
		title: "Create Your Profile",
		description:
			"Your profile is your media CV. Add your expertise, background, industry, social links and any previous press coverage - so when a journalist or podcast host sees your pitch, they already know you're the right fit.",
	},
	{
		number: 2,
		title: "Browse Opportunities",
		description:
			"Every day, new opportunities land on the platform from journalists, podcast hosts, editors and event organisers actively looking for experts like you.",
	},
	{
		number: 3,
		title: "Pitch and Get Featured",
		description:
			"Found an opportunity that fits? Send your pitch in minutes. If selected, you'll hear directly from the outlet - and your next feature begins.",
	},
];

export function HowItWorksSection() {
	return (
		<section id="how-it-works" className="bg-white px-6 py-20 sm:py-24">
			<div className="mx-auto max-w-5xl">
				<div className="text-center">
					<Heading level={2}>How it Works</Heading>
					<Text variant="section-lead">
						Get started in minutes and start landing opportunities today
					</Text>
				</div>

				<div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
					{steps.map((step) => (
						<article
							key={step.number}
							className="flex flex-col items-center text-center"
						>
							<div className="flex size-12 items-center justify-center rounded-full bg-black text-lg font-semibold text-white">
								{step.number}
							</div>
							<Heading level={3} variant="card-mt-5">
								{step.title}
							</Heading>
							<Text variant="card-body-narrow">{step.description}</Text>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
