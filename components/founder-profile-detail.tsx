"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { ProfileHighlight } from "@customTypes/profileHighlight";
import type { Tag } from "@customTypes/tag";
import type { GalleryAsset } from "@hooks/useAdvertisement";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import { HistoryBackLink } from "@/components/history-back-link";
import { ProfilePageEditButton } from "@/components/pages/Profile/ProfilePageEditButton";
import { ProfileAvatarSection } from "@/components/profile-avatar-section";
import { ProfileBioContent } from "@/components/profile-bio-content";
import { ProfileGallerySection } from "@/components/profile-gallery-section";
import { ProfileHighlightsSection } from "@/components/profile-highlights-section";
import Text from "@/components/Text";
import type { ProfileFormValues } from "@/lib/profileForm";
import { bioToApiField, profileLinksFromFormValues } from "@/lib/profileForm";
import type { ProfileLink } from "@/lib/profiles";

function ExternalLinkIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-3.5 shrink-0"
			aria-hidden
		>
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

function MapPinIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-3.5 shrink-0 text-gray-400"
			aria-hidden
		>
			<title>Location</title>
			<path
				d="M8 14s4-3 4-7a4 4 0 1 0-8 0c0 4 4 7 4 7Z"
				stroke="currentColor"
				strokeWidth="1.25"
			/>
			<circle cx="8" cy="7" r="1.25" fill="currentColor" />
		</svg>
	);
}

function MailIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-4 shrink-0"
			aria-hidden
		>
			<title>Email</title>
			<rect
				x="2"
				y="4"
				width="12"
				height="9"
				rx="1.5"
				stroke="currentColor"
				strokeWidth="1.25"
			/>
			<path
				d="M2 5.5l6 4 6-4"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function LinkIcon({ type }: { type: ProfileLink["type"] }) {
	if (type === "website") {
		return (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				className="size-4 shrink-0 text-gray-500"
				aria-hidden
			>
				<title>Website</title>
				<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
				<path
					d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"
					stroke="currentColor"
					strokeWidth="1.25"
				/>
			</svg>
		);
	}

	if (type === "instagram") {
		return (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				className="size-4 shrink-0 text-gray-500"
				aria-hidden
			>
				<title>Instagram</title>
				<rect
					x="2.5"
					y="2.5"
					width="11"
					height="11"
					rx="3"
					stroke="currentColor"
					strokeWidth="1.25"
				/>
				<circle
					cx="8"
					cy="8"
					r="2.5"
					stroke="currentColor"
					strokeWidth="1.25"
				/>
				<circle cx="11.5" cy="4.5" r="0.75" fill="currentColor" />
			</svg>
		);
	}

	if (type === "linkedin") {
		return (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				className="size-4 shrink-0 text-gray-500"
				aria-hidden
			>
				<title>LinkedIn</title>
				<rect
					x="2"
					y="2"
					width="12"
					height="12"
					rx="2"
					stroke="currentColor"
					strokeWidth="1.25"
				/>
				<path
					d="M5 7v4M5 5.5v.01M8 11V8.5a1.5 1.5 0 0 1 3 0V11"
					stroke="currentColor"
					strokeWidth="1.25"
					strokeLinecap="round"
				/>
			</svg>
		);
	}

	if (type === "facebook") {
		return (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				className="size-4 shrink-0 text-gray-500"
				aria-hidden
			>
				<title>Facebook</title>
				<path
					d="M9 3h2V0H9C6.8 0 5 1.8 5 4v2H3v3h2v6h3V9h2.5L11 6H8V4.5c0-.8.7-1.5 1-1.5Z"
					fill="currentColor"
				/>
			</svg>
		);
	}

	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-4 shrink-0 text-gray-500"
			aria-hidden
		>
			<title>X</title>
			<path
				d="M4 4l8 8M12 4l-8 8"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
		</svg>
	);
}

type LiveProfileDisplay = {
	displayName: string;
	tagline: string | null;
	location: string | null;
	bio: string | null;
	links: ProfileLink[];
	tagNames: string[];
	profileFormValues: ProfileFormValues;
};

const buildLiveProfileDisplay = ({
	displayName,
	fallbackName,
	tagline,
	location,
	bio,
	links = [],
	tags = [],
	profileFormValues,
}: {
	displayName?: string;
	fallbackName: string;
	tagline?: string | null;
	location?: string | null;
	bio?: string | null;
	links?: ProfileLink[];
	tags?: Tag[];
	profileFormValues: ProfileFormValues;
}): LiveProfileDisplay => ({
	displayName: displayName ?? fallbackName,
	tagline: tagline?.trim() || null,
	location: location?.trim() || null,
	bio: bio ?? null,
	links,
	tagNames: tags.map((tag) => tag.name),
	profileFormValues,
});

const liveProfileDisplayFromFormValues = (
	values: ProfileFormValues,
	profileUsername: string,
): LiveProfileDisplay => {
	const displayName =
		[values.first_name, values.last_name].filter(Boolean).join(" ").trim() ||
		profileUsername;

	return {
		displayName,
		tagline: values.headline.trim() || null,
		location: values.city.trim() || null,
		bio: bioToApiField(values.bio) || null,
		links: profileLinksFromFormValues(values),
		tagNames: values.tags.map((tag) => tag.label),
		profileFormValues: values,
	};
};

type FounderProfileDetailProps = {
	displayName?: string;
	avatarUrl?: string | null;
	location?: string | null;
	openToMedia?: boolean;
	tagline?: string | null;
	bio?: string | null;
	gallery?: GalleryAsset[];
	highlights?: ProfileHighlight[];
	links?: ProfileLink[];
	tags?: Tag[];
	profileUsername: string;
	profileFormValues: ProfileFormValues;
	userPk: number;
};

export function FounderProfileDetail({
	displayName,
	avatarUrl,
	location,
	openToMedia = false,
	tagline,
	bio,
	gallery = [],
	highlights = [],
	links = [],
	tags = [],
	profileUsername,
	profileFormValues,
	userPk,
}: FounderProfileDetailProps) {
	const fallbackName = profileUsername;
	const [liveProfile, setLiveProfile] = useState<LiveProfileDisplay>(() =>
		buildLiveProfileDisplay({
			displayName,
			fallbackName,
			tagline,
			location,
			bio,
			links,
			tags,
			profileFormValues,
		}),
	);

	useEffect(() => {
		setLiveProfile(
			buildLiveProfileDisplay({
				displayName,
				fallbackName,
				tagline,
				location,
				bio,
				links,
				tags,
				profileFormValues,
			}),
		);
	}, [profileUsername]);

	const name = liveProfile.displayName;
	const displayTagline = liveProfile.tagline;
	return (
		<div className="min-h-full bg-white font-sans">
			<header className="border-b border-gray-200 px-6 py-4">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
					<HistoryBackLink className="text-sm font-medium text-gray-500 transition-colors hover:text-black">
						← Back
					</HistoryBackLink>
					<Link
						href="/"
						className="text-lg font-semibold tracking-tight text-black"
					>
						Spotlight
					</Link>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 py-10">
				<div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
					<aside>
						<ProfileAvatarSection
							name={name}
							initialAvatarUrl={avatarUrl}
							profileUsername={profileUsername}
						/>

						<Heading level={1} variant="page-profile">
							{name}
						</Heading>
						{displayTagline ? (
							<Text variant="profile-role">{displayTagline}</Text>
						) : null}
						{liveProfile.location ? (
							<Text variant="profile-location">
								<MapPinIcon />
								{liveProfile.location}
							</Text>
						) : null}

						<Button
							type="button"
							isFullWidth
							borderRadius="large"
							textTransform="none"
							className="mt-6 border-none bg-linear-to-r from-violet-600 to-fuchsia-500 hover:bg-linear-to-r hover:opacity-90"
						>
							<span className="inline-flex items-center justify-center gap-2">
								<MailIcon />
								Contact for media
							</span>
						</Button>

						{liveProfile.links.length > 0 ? (
							<ul className="mt-4 space-y-2">
								{liveProfile.links.map((link) => (
									<li key={`${link.type}-${link.href}`}>
										<a
											href={link.href}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
										>
											<LinkIcon type={link.type} />
											<span className="min-w-0 flex-1 truncate">
												{link.label}
											</span>
											<ExternalLinkIcon />
										</a>
									</li>
								))}
							</ul>
						) : null}

						{liveProfile.tagNames.length > 0 ? (
							<div className="mt-8">
								<Text variant="label">Speaks about</Text>
								<ul className="mt-3 flex flex-wrap gap-2">
									{liveProfile.tagNames.map((topic) => (
										<li
											key={topic}
											className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
										>
											{topic}
										</li>
									))}
								</ul>
							</div>
						) : null}
					</aside>

					<div>
						<div className="flex items-center justify-between gap-4">
							{openToMedia ? (
								<span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
									<span className="size-1.5 rounded-full bg-violet-500" />
									Open to media opportunities
								</span>
							) : (
								<span />
							)}
							<ProfilePageEditButton
								profileUsername={profileUsername}
								initialValues={liveProfile.profileFormValues}
								onProfileSaved={(values) => {
									setLiveProfile(
										liveProfileDisplayFromFormValues(values, profileUsername),
									);
								}}
							/>
						</div>

						<ProfileBioContent
							bio={liveProfile.bio}
							key={liveProfile.bio ?? "empty"}
						/>

						<ProfileGallerySection
							displayName={name}
							initialGallery={gallery}
							profileUsername={profileUsername}
							userPk={userPk}
						/>

						<ProfileHighlightsSection
							initialHighlights={highlights}
							profileUsername={profileUsername}
							userPk={userPk}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
