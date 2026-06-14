import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import type { Opportunity } from "@/lib/opportunities";

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

function ExternalLinkIcon() {
	return (
		<svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
			<title>External link</title>
			<path
				d="M10 3h3v3M9 7l4-4M6 4H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ClockIcon() {
	return (
		<svg
			viewBox="0 0 20 20"
			fill="none"
			className="size-4 text-gray-400"
			aria-hidden
		>
			<title>Clock</title>
			<circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
			<path
				d="M10 6v4l2.5 2.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function CalendarIcon() {
	return (
		<svg
			viewBox="0 0 20 20"
			fill="none"
			className="size-4 text-gray-400"
			aria-hidden
		>
			<title>Calendar</title>
			<rect
				x="3"
				y="4"
				width="14"
				height="13"
				rx="1.5"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M3 8h14M7 2v3M13 2v3"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function BookIcon() {
	return (
		<svg
			viewBox="0 0 20 20"
			fill="none"
			className="size-4 text-gray-400"
			aria-hidden
		>
			<title>Book</title>
			<path
				d="M4 4h5a2 2 0 0 1 2 2v10H6a2 2 0 0 0-2 2V4Zm6 2h5a2 2 0 0 1 2 2v8h-7V6Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function MapPinIcon() {
	return (
		<svg
			viewBox="0 0 20 20"
			fill="none"
			className="size-4 text-gray-400"
			aria-hidden
		>
			<title>Location</title>
			<path
				d="M10 17s5-4.5 5-9a5 5 0 1 0-10 0c0 4.5 5 9 5 9Z"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<circle cx="10" cy="8" r="1.5" fill="currentColor" />
		</svg>
	);
}

function GlobeIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-4 text-gray-400"
			aria-hidden
		>
			<title>Globe</title>
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
			<path
				d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"
				stroke="currentColor"
				strokeWidth="1.25"
			/>
		</svg>
	);
}

function UsersIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-4 text-gray-400"
			aria-hidden
		>
			<title>Readers</title>
			<circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.25" />
			<path
				d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
			<circle
				cx="11.5"
				cy="5.5"
				r="1.5"
				stroke="currentColor"
				strokeWidth="1.25"
			/>
			<path
				d="M10 13c.3-1.5 1.4-2.5 3-2.5"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function NewspaperIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-4 text-gray-400"
			aria-hidden
		>
			<title>Newspaper</title>
			<rect
				x="2"
				y="3"
				width="12"
				height="10"
				rx="1"
				stroke="currentColor"
				strokeWidth="1.25"
			/>
			<path
				d="M5 6h4M5 9h6"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function DetailCard({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4">
			<div className="mb-3">{icon}</div>
			<Text variant="detail-label">{label}</Text>
			<Text variant="detail-value">{value}</Text>
		</div>
	);
}

function PublicationStat({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="mt-0.5">{icon}</div>
			<div>
				<Text variant="detail-label">{label}</Text>
				<Text variant="detail-value-medium">{value}</Text>
			</div>
		</div>
	);
}

type OpportunityDetailProps = {
	opportunity: Opportunity;
};

export function OpportunityDetail({ opportunity }: OpportunityDetailProps) {
	const publicationDomain = opportunity.publication.url.replace(
		/^https?:\/\//,
		"",
	);

	return (
		<div className="min-h-full bg-white font-sans">
			<header className="border-b border-gray-200 px-6 py-4">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<Link
						href="/"
						className="text-sm font-medium text-gray-500 transition-colors hover:text-black"
					>
						← Back to opportunities
					</Link>
					<Link
						href="/"
						className="text-lg font-semibold tracking-tight text-black"
					>
						Spotlight
					</Link>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 py-10">
				<div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
								{opportunity.type}
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700">
								<span className="size-1.5 rounded-full bg-green-500" />
								Open
							</span>
						</div>

						<Heading level={1} variant="page-detail">
							{opportunity.title}
						</Heading>

						<Text variant="section-lead-relaxed">
							{opportunity.description}
						</Text>

						<div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50/50 p-6">
							<Heading level={2} variant="subsection-sm">
								What the reporter is looking for
							</Heading>
							<ul className="mt-4 space-y-3">
								{opportunity.requirements.map((requirement) => (
									<li
										key={requirement}
										className="flex gap-3 text-sm text-gray-600"
									>
										<CheckIcon />
										{requirement}
									</li>
								))}
							</ul>
						</div>

						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<DetailCard
								icon={<ClockIcon />}
								label="Deadline"
								value={opportunity.deadline}
							/>
							<DetailCard
								icon={<CalendarIcon />}
								label="Interview window"
								value={opportunity.interviewWindow}
							/>
							<DetailCard
								icon={<BookIcon />}
								label="Article type"
								value={opportunity.articleType}
							/>
							<DetailCard
								icon={<MapPinIcon />}
								label="Location"
								value={opportunity.location}
							/>
						</div>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button type="button" borderRadius="large" textTransform="none">
								<span className="inline-flex items-center justify-center gap-2">
									<svg
										viewBox="0 0 16 16"
										fill="none"
										className="size-4"
										aria-hidden
									>
										<title>Apply</title>
										<path
											d="M4 8l3 3 5-6"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									Apply now
								</span>
							</Button>
							<Button
								type="button"
								strVariant="transparentWithBorder"
								borderRadius="large"
								textTransform="none"
							>
								<span className="inline-flex items-center justify-center gap-2">
									<svg
										viewBox="0 0 16 16"
										fill="none"
										className="size-4"
										aria-hidden
									>
										<title>Pass</title>
										<path
											d="M4 4l8 8M12 4l-8 8"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
										/>
									</svg>
									Pass
								</span>
							</Button>
						</div>
					</div>

					<aside className="space-y-5">
						<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
							<div className="h-16 bg-linear-to-r from-violet-100 via-fuchsia-50 to-orange-50" />
							<div className="px-6 pb-6">
								<div className="-mt-8 relative mx-auto size-16 overflow-hidden rounded-full border-4 border-white bg-gray-200">
									<Image
										src={opportunity.reporter.avatarUrl}
										alt={opportunity.reporter.name}
										fill
										sizes="64px"
										className="object-cover"
									/>
								</div>
								<div className="mt-4 text-center">
									<Heading level={3}>{opportunity.reporter.name}</Heading>
									<Text variant="reporter-title">
										{opportunity.reporter.title}
									</Text>
									<Text variant="reporter-publication">
										{opportunity.reporter.publication}
									</Text>
								</div>
								<Text variant="reporter-bio">{opportunity.reporter.bio}</Text>
								<a
									href={opportunity.reporter.profileUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-black transition-colors hover:text-violet-600"
								>
									Profile
									<ExternalLinkIcon />
								</a>
							</div>
						</div>

						<div className="rounded-2xl border border-gray-200 bg-white p-6">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
									{opportunity.publication.slug}
								</div>
								<div>
									<Text variant="publication-name">
										{opportunity.publication.name}
									</Text>
									<Text variant="publication-domain">{publicationDomain}</Text>
								</div>
							</div>

							<div className="mt-5 space-y-4">
								<PublicationStat
									icon={<GlobeIcon />}
									label="Category"
									value={opportunity.publication.category}
								/>
								<PublicationStat
									icon={<UsersIcon />}
									label="Monthly readers"
									value={opportunity.publication.monthlyReaders}
								/>
								<PublicationStat
									icon={<NewspaperIcon />}
									label="Print circulation"
									value={opportunity.publication.printCirculation}
								/>
								<PublicationStat
									icon={<CalendarIcon />}
									label="Founded"
									value={opportunity.publication.founded}
								/>
							</div>

							<a
								href={opportunity.publication.url}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-50"
							>
								Visit publication
								<ExternalLinkIcon />
							</a>
						</div>

						<div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-6">
							<Text variant="sidebar-heading">Your match score</Text>
							<Text variant="match-score">
								<span className="text-3xl font-bold text-violet-600">
									{opportunity.matchScore}%
								</span>{" "}
								<span className="text-sm text-gray-500">compatibility</span>
							</Text>
							<div className="mt-4 h-2 overflow-hidden rounded-full bg-violet-100">
								<div
									className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500"
									style={{ width: `${opportunity.matchScore}%` }}
								/>
							</div>
							<Text variant="sidebar-footnote">
								Based on your profile, expertise tags, and past placements.
							</Text>
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}
