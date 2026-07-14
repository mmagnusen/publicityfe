"use client";

import { useEffect, useState } from "react";

const words = [
	"interviews",
	"articles",
	"podcasts",
	"panels",
	"radio",
	"magazines",
];

const longestWord = words.reduce((longest, word) =>
	word.length > longest.length ? word : longest,
);

const TYPE_MS = 70;
const DELETE_MS = 45;
const HOLD_MS = 1200;
const PAUSE_BETWEEN_MS = 300;
const CLASSIC_INTERVAL_MS = 1000;

type Phase = "typing" | "holding" | "deleting" | "pausing";

type RotatingWordProps = {
	/** `classic` = original flip animation (coming soon). `typewriter` = marketing home. */
	variant?: "classic" | "typewriter";
};

function ClassicRotatingWord() {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((current) => (current + 1) % words.length);
		}, CLASSIC_INTERVAL_MS);

		return () => clearInterval(interval);
	}, []);

	const word = words[index];

	return (
		<span
			className="relative mt-1 inline-block"
			aria-live="polite"
			aria-atomic="true"
		>
			<span
				className="absolute inset-0 -z-10 blur-2xl"
				aria-hidden
				style={{
					background:
						"linear-gradient(90deg, rgba(168, 85, 247, 0.45) 0%, rgba(249, 115, 22, 0.35) 100%)",
				}}
			/>
			<span className="inline-grid">
				<span className="invisible col-start-1 row-start-1" aria-hidden>
					{longestWord}
				</span>
				<span
					key={word}
					className="col-start-1 row-start-1 origin-bottom bg-linear-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent animate-zoom-up"
				>
					{word}
				</span>
			</span>
		</span>
	);
}

function TypewriterRotatingWord() {
	const [wordIndex, setWordIndex] = useState(0);
	const [displayed, setDisplayed] = useState("");
	const [phase, setPhase] = useState<Phase>("typing");

	const fullWord = words[wordIndex] ?? "";

	useEffect(() => {
		let timeoutId: number;

		if (phase === "typing") {
			if (displayed.length < fullWord.length) {
				timeoutId = window.setTimeout(() => {
					setDisplayed(fullWord.slice(0, displayed.length + 1));
				}, TYPE_MS);
			} else {
				timeoutId = window.setTimeout(() => {
					setPhase("holding");
				}, HOLD_MS);
			}
		} else if (phase === "holding") {
			timeoutId = window.setTimeout(() => {
				setPhase("deleting");
			}, 0);
		} else if (phase === "deleting") {
			if (displayed.length > 0) {
				timeoutId = window.setTimeout(() => {
					setDisplayed((current) => current.slice(0, -1));
				}, DELETE_MS);
			} else {
				timeoutId = window.setTimeout(() => {
					setPhase("pausing");
				}, PAUSE_BETWEEN_MS);
			}
		} else {
			timeoutId = window.setTimeout(() => {
				setWordIndex((current) => (current + 1) % words.length);
				setPhase("typing");
			}, 0);
		}

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [displayed, fullWord, phase]);

	return (
		<span
			className="relative mt-1 inline-block sm:mt-0"
			aria-live="polite"
			aria-atomic="true"
		>
			<span
				className="absolute inset-0 -z-10 blur-2xl"
				aria-hidden
				style={{
					background: "rgba(255, 0, 174, 0.35)",
				}}
			/>
			<span className="inline-grid text-left">
				<span className="invisible col-start-1 row-start-1" aria-hidden>
					{longestWord}
				</span>
				<span className="col-start-1 row-start-1 inline-flex items-center text-[#FF00AE]">
					{displayed}
					<span
						aria-hidden
						className="ml-1 inline-block h-[1cap] w-[0.065em] shrink-0 self-center bg-[#FF00AE] animate-pulse"
					/>
				</span>
			</span>
		</span>
	);
}

export function RotatingWord({ variant = "classic" }: RotatingWordProps) {
	if (variant === "typewriter") {
		return <TypewriterRotatingWord />;
	}

	return <ClassicRotatingWord />;
}
