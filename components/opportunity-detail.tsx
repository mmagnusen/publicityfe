import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import RichTextRenderer from "@components/RichTextRenderer";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { OpportunityFavouriteToggle } from "@/components/OpportunityFavouriteToggle";
import Tag from "@/components/Tag";
import Text from "@/components/Text";
import type { Opportunity } from "@/lib/opportunities";

function ReporterAvatar({
	name,
	avatarUrl,
}: {
	name: string;
	avatarUrl: string;
}) {
	if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
		return (
			// Profile images come from Bytescale CDN URLs — not in next/image config.
			// eslint-disable-next-line @next/next/no-img-element
			<img src={avatarUrl} alt={name} className="size-full object-cover" />
		);
	}

	return (
		<Image
			src={avatarUrl}
			alt={name}
			fill
			sizes="64px"
			className="object-cover"
		/>
	);
}

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
	const showPublicationDomain = publicationDomain.length > 0;

	return (
		<div className="min-h-full bg-white font-sans">
			<header className="border-b border-gray-200 px-6 py-4">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<Link
						href="/opportunity"
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

						<p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
							<CalendarIcon />
							{opportunity.hasApplicationDeadline ? (
								<>
									Application deadline:{" "}
									<span className="font-medium text-gray-900">
										{opportunity.deadline}
									</span>
								</>
							) : (
								<span className="font-medium text-gray-900">
									Ongoing — no application deadline
								</span>
							)}
						</p>

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

						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
							<OpportunityFavouriteToggle
								isFavorited={opportunity.isFavorited}
								opportunityId={Number(opportunity.id)}
								variant="button"
							/>
						</div>
					</div>

					<aside className="space-y-5">
						<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
							<div className="h-16 bg-linear-to-r from-violet-100 via-fuchsia-50 to-orange-50" />
							<div className="px-6 pb-6">
								<div className="-mt-8 relative mx-auto size-16 overflow-hidden rounded-full border-4 border-white bg-gray-200">
									<ReporterAvatar
										name={opportunity.reporter.name}
										avatarUrl={opportunity.reporter.avatarUrl}
									/>
								</div>
								<div className="mt-4 text-center">
									<Heading level={3}>{opportunity.reporter.name}</Heading>
									{opportunity.reporter.title ? (
										<Text variant="reporter-title">
											{opportunity.reporter.title}
										</Text>
									) : null}
									<Text variant="reporter-publication">
										{opportunity.reporter.publication}
									</Text>
								</div>
								{opportunity.reporter.shortDescription ? (
									<RichTextRenderer
										className="mt-4 text-center text-sm leading-relaxed text-gray-500 [&_p]:text-center [&_p]:text-sm [&_p]:text-gray-500"
										richText={opportunity.reporter.shortDescription}
									/>
								) : null}
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
									{showPublicationDomain ? (
										<Text variant="publication-domain">
											{publicationDomain}
										</Text>
									) : null}
								</div>
							</div>

							{opportunity.publication.foundedYear != null ? (
								<div className="mt-5 space-y-4">
									<PublicationStat
										icon={<CalendarIcon />}
										label="Founded"
										value={String(opportunity.publication.foundedYear)}
									/>
								</div>
							) : null}

							{opportunity.publication.tags.length > 0 ? (
								<div className="mt-5">
									<Text variant="detail-label">Tags</Text>
									<ul className="mt-2 flex flex-wrap gap-2">
										{opportunity.publication.tags.map((tag) => (
											<li key={tag.pk}>
												<Tag skin="alt">{tag.name}</Tag>
											</li>
										))}
									</ul>
								</div>
							) : null}

							{opportunity.publication.url ? (
								<a
									href={opportunity.publication.url}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-50"
								>
									Visit publication
									<ExternalLinkIcon />
								</a>
							) : null}
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}
