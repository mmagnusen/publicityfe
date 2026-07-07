import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";

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

export function DashboardAddOpportunitySection() {
	return (
		<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
			<Heading level={2} variant="subsection">
				Post an opportunity
			</Heading>
			<Text variant="card-body" className="mt-2 max-w-2xl">
				Do you need an expert opinion or a fresh voice? Post your opportunity
				now to reach hundreds of people. We promote every opportunity on:
			</Text>
			<ul className="mt-3 max-w-2xl list-none space-y-2">
				<li className="flex gap-3 text-sm leading-relaxed text-gray-500">
					<CheckIcon />
					LinkedIn
				</li>
				<li className="flex gap-3 text-sm leading-relaxed text-gray-500">
					<CheckIcon />
					Instagram
				</li>
				<li className="flex gap-3 text-sm leading-relaxed text-gray-500">
					<CheckIcon />
					Our daily bulletin to all members
				</li>
			</ul>
			<div className="mt-4">
				<Button href="/create-opportunity" textTransform="none">
					Add opportunity
				</Button>
			</div>
		</div>
	);
}
