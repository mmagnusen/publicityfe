"use client";

import { useEffect, useState } from "react";

const words = ["interviews", "podcasts", "panels", "magazines"];

const longestWord = words.reduce((longest, word) =>
	word.length > longest.length ? word : longest,
);

export function RotatingWord() {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((current) => (current + 1) % words.length);
		}, 1000);

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
