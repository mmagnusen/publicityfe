"use client";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import { Footer } from "@/components/Footer";
import Heading from "@/components/Heading";
import { Navigation } from "@/components/Navigation";
import Text from "@/components/Text";

type Section = {
	body: string | string[];
	title: string;
};

type Props = {
	footnote?: string;
	intro?: string;
	pageTitle: string;
	sections: Section[];
};

export function LegalPageContent({
	footnote,
	intro,
	pageTitle,
	sections,
}: Props) {
	const { isLoggedIn } = useAuthenticatedUser();

	return (
		<div className="min-h-full bg-white font-sans">
			<Navigation isLoggedIn={isLoggedIn} />

			<main className="px-6 py-16 sm:py-24">
				<div className="mx-auto max-w-3xl">
					<Heading level={1} variant="page-lg">
						{pageTitle}
					</Heading>
					{intro ? (
						<Text variant="page-subtitle" className="mt-3">
							{intro}
						</Text>
					) : null}

					<div className="mt-10 space-y-8">
						{sections.map((section) => {
							const paragraphs = Array.isArray(section.body)
								? section.body
								: [section.body];

							return (
								<section key={section.title}>
									<Heading level={2} variant="subsection">
										{section.title}
									</Heading>
									{paragraphs.map((paragraph) => (
										<p
											key={paragraph.slice(0, 48)}
											className="mt-3 text-[0.9375rem] leading-relaxed text-gray-600"
										>
											{paragraph}
										</p>
									))}
								</section>
							);
						})}
					</div>

					{footnote ? (
						<p className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
							{footnote}
						</p>
					) : null}
				</div>
			</main>

			<Footer />
		</div>
	);
}
