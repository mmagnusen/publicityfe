"use client";

import { useState } from "react";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { homeFaqs } from "@/constants/homeFaqs";
import { cn } from "@/lib/cn";

function formatFaqIndex(index: number): string {
	return String(index + 1).padStart(3, "0");
}

type FaqAccordionItemProps = {
	answer: string;
	index: number;
	isOpen: boolean;
	onToggle: () => void;
	question: string;
};

function FaqAccordionItem({
	answer,
	index,
	isOpen,
	onToggle,
	question,
}: FaqAccordionItemProps) {
	const panelId = `faq-panel-${index}`;
	const buttonId = `faq-button-${index}`;

	return (
		<div
			className={cn(
				"rounded-2xl bg-gray-50 px-5 py-4 transition-colors sm:px-6 sm:py-5",
				isOpen && "border-2 border-black bg-white",
			)}
		>
			<button
				aria-controls={panelId}
				aria-expanded={isOpen}
				className="flex w-full items-start gap-4 text-left"
				id={buttonId}
				onClick={onToggle}
				type="button"
			>
				<span className="w-8 shrink-0 pt-0.5 text-xs font-medium tabular-nums text-gray-400">
					{formatFaqIndex(index)}
				</span>
				<span className="min-w-0 flex-1 text-base font-semibold text-black sm:text-lg">
					{question}
				</span>
				<span
					aria-hidden
					className="flex size-8 shrink-0 items-center justify-center text-xl leading-none text-gray-500"
				>
					{isOpen ? "−" : "+"}
				</span>
			</button>
			<div
				aria-labelledby={buttonId}
				className={cn(
					"grid transition-[grid-template-rows] duration-200 ease-out",
					isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
				id={panelId}
				role="region"
			>
				<div className="overflow-hidden">
					<p className="pb-1 pl-12 pr-12 text-sm leading-relaxed text-gray-500 sm:text-base">
						{answer}
					</p>
				</div>
			</div>
		</div>
	);
}

export function FaqsSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<section id="faqs" className="bg-white px-6 py-20 sm:py-24">
			<div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
				<div className="lg:sticky lg:top-28">
					<Text variant="eyebrow">FAQs</Text>
					<Heading level={2} className="mt-3">
						Frequently asked questions
					</Heading>
					<Text variant="section-lead-relaxed" className="mt-4 max-w-md">
						Quick answers to common questions about how the platform works, what
						it costs, and how to land your next feature.
					</Text>
					<Button className="mt-8" href="/contact-us" textTransform="none">
						Contact us
					</Button>
				</div>

				<div className="space-y-3 sm:space-y-4">
					{homeFaqs.map((faq, index) => (
						<FaqAccordionItem
							key={faq.question}
							answer={faq.answer}
							index={index}
							isOpen={openIndex === index}
							onToggle={() =>
								setOpenIndex((current) => (current === index ? null : index))
							}
							question={faq.question}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
