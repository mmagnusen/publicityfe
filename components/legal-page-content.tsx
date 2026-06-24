"use client";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import { Footer } from "@/components/Footer";
import Heading from "@/components/Heading";
import { Navigation } from "@/components/Navigation";
import Text from "@/components/Text";

type Section = {
	body: string;
	title: string;
};

type Props = {
	footnote?: string;
	intro: string;
	pageTitle: string;
	sections: Section[];
};

export function LegalPageContent({
	footnote = "This page is a placeholder. Full legal copy will be published here before launch.",
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
					<Text variant="page-subtitle" className="mt-3">
						{intro}
					</Text>

					<div className="mt-10 space-y-8">
						{sections.map((section) => (
							<section key={section.title}>
								<Heading level={2} variant="subsection">
									{section.title}
								</Heading>
								<p className="mt-3 text-[0.9375rem] leading-relaxed text-gray-600">
									{section.body}
								</p>
							</section>
						))}
					</div>

					<p className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
						{footnote}
					</p>
				</div>
			</main>

			<Footer />
		</div>
	);
}
