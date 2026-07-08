import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { RotatingWord } from "@/components/rotating-word";
import Text from "@/components/Text";

function ArrowIcon() {
	return (
		<svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
			<title>Arrow right</title>
			<path
				d="M3 8h10M9 4l4 4-4 4"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function HeroSection() {
	return (
		<section className="bg-white px-6 pt-12 pb-20 sm:pt-16 sm:pb-28">
			<div className="mx-auto flex max-w-3xl flex-col items-center text-center">
				<div className="mb-8 inline-flex items-center rounded-full border border-gray-200 bg-gray-50/80 px-4 py-1.5 text-sm font-semibold text-black">
					⚡ Early access now open
				</div>

				<Heading level={1} variant="hero">
					Get featured on
					<br />
					<RotatingWord />
				</Heading>

				<Text variant="hero-lead">
					Connect with journalists, podcast hosts, and event organizers who are
					actively looking for founders and experts to feature.
				</Text>

				<Button
					href="/register"
					borderRadius="pill"
					size="large"
					textTransform="none"
					className="mt-10"
				>
					<span className="inline-flex items-center gap-2">
						Get started for free
						<ArrowIcon />
					</span>
				</Button>

				<Text variant="hero-note">No credit card required.</Text>
			</div>
		</section>
	);
}
