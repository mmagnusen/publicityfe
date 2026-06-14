import Heading from "@/components/Heading";
import Text from "@/components/Text";

const steps = [
	{
		number: 1,
		title: "Create Your Profile",
		description:
			"Tell us about your expertise, experience, and the topics you're passionate about. Add your media kit and portfolio.",
	},
	{
		number: 2,
		title: "Get Matched",
		description:
			"Our AI scans thousands of opportunities daily and matches you with relevant press, podcasts, and panels.",
	},
	{
		number: 3,
		title: "Land Opportunities",
		description:
			"Review, accept, and manage your bookings. We handle the logistics so you can focus on sharing your expertise.",
	},
];

export function HowItWorksSection() {
	return (
		<section id="how-it-works" className="bg-white px-6 py-20 sm:py-24">
			<div className="mx-auto max-w-5xl">
				<div className="text-center">
					<Heading level={2}>Simple, Fast, Effective</Heading>
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
