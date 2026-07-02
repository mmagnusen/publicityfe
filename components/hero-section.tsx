import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { RotatingWord } from "@/components/rotating-word";
import Text from "@/components/Text";

function MegaphoneIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-3.5 shrink-0 text-blue-500"
			aria-hidden
		>
			<title>Megaphone</title>
			<path d="M2 5.5v5L5.5 12V4L2 5.5Z" fill="currentColor" />
			<path
				d="M5.5 4L11 2v12l-5.5-2V4Z"
				stroke="currentColor"
				strokeWidth="1"
				fill="none"
			/>
			<path
				d="M12.5 5.5c1 1 1 4 0 5"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
		</svg>
	);
}

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
		<section className="bg-white px-6 pt-12 pb-24 sm:pt-16 sm:pb-32">
			<div className="mx-auto flex max-w-3xl flex-col items-center text-center">
				<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 px-4 py-1.5 text-sm">
					<MegaphoneIcon />
					<span>
						<span className="font-semibold text-black">
							127 new opportunities
						</span>{" "}
						<span className="text-gray-500">added today</span>
					</span>
				</div>

				<Heading level={1} variant="hero">
					Promote yourself on
					<br />
					<RotatingWord />
				</Heading>

				<Text variant="hero-lead">
					Connect with journalists, podcast hosts, and event organizers actively
					looking for experts like you.
				</Text>

				<Button
					href="/register"
					borderRadius="pill"
					size="large"
					textTransform="none"
					className="mt-10"
				>
					<span className="inline-flex items-center gap-2">
						Get Started
						<ArrowIcon />
					</span>
				</Button>

				<Text variant="hero-note">Pause or cancel service anytime.</Text>
			</div>
		</section>
	);
}
