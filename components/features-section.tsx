import Heading from "@/components/Heading";
import Text from "@/components/Text";

function MicrophoneIcon() {
	return (
		<svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
			<title>Microphone</title>
			<rect
				x="8"
				y="3"
				width="4"
				height="8"
				rx="2"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M5 10a5 5 0 0 0 10 0M10 15v2M7 17h6"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function NewspaperIcon() {
	return (
		<svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
			<title>Newspaper</title>
			<rect
				x="3"
				y="4"
				width="14"
				height="12"
				rx="1.5"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M6 8h5M6 11h8M6 14h6"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<rect
				x="12"
				y="6"
				width="3"
				height="3"
				rx="0.5"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

function PeopleIcon() {
	return (
		<svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
			<title>People</title>
			<circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
			<path
				d="M3 16c0-2.761 2.239-5 5-5s5 2.239 5 5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<circle cx="14" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
			<path
				d="M14 12c2.5 0 4 1.5 4 4"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function TargetIcon() {
	return (
		<svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
			<title>Target</title>
			<circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
			<circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
			<circle cx="10" cy="10" r="1" fill="currentColor" />
		</svg>
	);
}

function ChartIcon() {
	return (
		<svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
			<title>Chart</title>
			<path
				d="M3 16V8l4-3 4 5 3-2 3 4"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function LightningIcon() {
	return (
		<svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
			<title>Lightning</title>
			<path
				d="M11 3L5 11h4l-1 6 7-9h-4l1-5Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

const features = [
	{
		icon: MicrophoneIcon,
		iconClassName: "bg-violet-500 text-white",
		title: "Podcast Placements",
		description:
			"Browse podcast opportunities from hosts actively looking for guests in your niche. Find the right show, send your pitch, and start building your audio presence.",
	},
	{
		icon: NewspaperIcon,
		iconClassName: "bg-pink-500 text-white",
		title: "Press Coverage",
		description:
			"Connect directly with journalists and editors seeking expert sources, contributors and story leads for features across print and digital publications.",
	},
	{
		icon: PeopleIcon,
		iconClassName: "bg-emerald-500 text-white",
		title: "Panel & Speaking",
		description:
			"Discover conference panels, live events and speaking opportunities that match your expertise - and get in front of the audiences that matter most to your business.",
	},
	{
		icon: TargetIcon,
		iconClassName: "bg-cyan-500 text-white",
		title: "Matched Opportunities",
		description:
			"Your profile tells us what you do and what you want to be known for. We use that to surface the opportunities most relevant to you - so you're not scrolling through things that don't fit.",
	},
	{
		icon: ChartIcon,
		iconClassName: "bg-purple-500 text-white",
		title: "Track Your Progress",
		description:
			"See every opportunity you've saved, applied to and landed - all in one place. Stay on top of deadlines and manage your pitches with ease.",
	},
	{
		icon: LightningIcon,
		iconClassName: "bg-orange-500 text-white",
		title: "Instant Alerts",
		description:
			"Never miss a time-sensitive opportunity. Get notified the moment a new press request, podcast slot or speaking opportunity lands that matches your profile.",
	},
];

export function FeaturesSection() {
	return (
		<section id="features" className="bg-gray-50 px-6 py-20 sm:py-24">
			<div className="mx-auto max-w-5xl">
				<div className="text-center">
					<Heading level={2}>Great businesses deserve great coverage</Heading>
					<Text variant="section-lead">
						Press coverage, podcast interviews, panel spots and speaking gigs -
						all in one place, without the PR agency price tag
					</Text>
				</div>

				<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => {
						const Icon = feature.icon;

						return (
							<article
								key={feature.title}
								className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
							>
								<div
									className={`flex size-10 items-center justify-center rounded-xl ${feature.iconClassName}`}
								>
									<Icon />
								</div>
								<Heading level={3} variant="card-mt-4">
									{feature.title}
								</Heading>
								<Text variant="card-body">{feature.description}</Text>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
