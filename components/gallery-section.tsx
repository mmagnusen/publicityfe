"use client";

import { useState } from "react";
import Link from "next/link";

import { resolveBytescaleDisplayUrl } from "@components/UploadButton";
import type { PublicUser } from "@customTypes/publicUser";
import {
	publicUserDisplayName,
	useFeaturedJournalists,
} from "@hooks/useFeaturedJournalists";

import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { FEATURED_JOURNALIST_USERNAMES } from "@/constants/featuredJournalists";
import { TRADING_NAME } from "@/constants/tradingName";
import { profilePagePath } from "@/lib/publicUser";

const FOUNDER_IMAGE_ZOOM_TRANSITION =
	"transform 3.5s cubic-bezier(0.22, 1, 0.36, 1)";

function JournalistCard({ user }: { user: PublicUser }) {
	const [isHovered, setIsHovered] = useState(false);
	const name = publicUserDisplayName(user);
	const tagline =
		user.human_profile?.tagline?.trim() ||
		user.human_profile?.headline?.trim() ||
		null;
	const imageUrl = resolveBytescaleDisplayUrl(
		user.human_profile?.profile_image_url,
	);
	const href = user.username?.trim() ? profilePagePath(user.username) : null;

	if (!href) {
		return null;
	}

	return (
		<Link
			href={href}
			className="block"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="relative aspect-4/5 overflow-hidden rounded-xl sm:rounded-2xl">
				{imageUrl ? (
					<div
						className="size-full"
						style={{
							transform: isHovered ? "scale(1.08)" : "scale(1)",
							transition: FOUNDER_IMAGE_ZOOM_TRANSITION,
							transformOrigin: "center center",
						}}
					>
						{/* Profile images come from Bytescale CDN URLs- not in next/image config. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={imageUrl}
							alt={name}
							className="block size-full object-cover"
						/>
					</div>
				) : (
					<div className="flex size-full items-center justify-center bg-gray-200 text-2xl font-semibold text-gray-500">
						{name.charAt(0).toUpperCase() || "?"}
					</div>
				)}
			</div>
			<div className="mt-4">
				<p className="text-sm font-semibold text-gray-900 sm:text-base">
					{name}
				</p>
				{tagline ? (
					<p className="mt-0.5 line-clamp-2 text-xs text-gray-600 sm:text-sm">
						{tagline}
					</p>
				) : null}
			</div>
		</Link>
	);
}

export function GallerySection() {
	const { data: journalists } = useFeaturedJournalists(
		FEATURED_JOURNALIST_USERNAMES,
	);

	if (!FEATURED_JOURNALIST_USERNAMES.length || !journalists?.length) {
		return null;
	}

	return (
		<section className="bg-white px-6 py-20 sm:py-24">
			<div className="mx-auto max-w-4xl text-center">
				<Heading level={2}>
					Founders on {TRADING_NAME || "Get Featured"}
				</Heading>
				<Text variant="section-lead-relaxed" className="mx-auto mt-4 max-w-2xl">
					Founders across every industry are using{" "}
					{TRADING_NAME || "Get Featured"} to land coverage, grow their
					authority and get in front of the right audiences.
				</Text>
			</div>
			<div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-3 gap-3 sm:mt-14 sm:gap-4">
				{journalists.map((user, index) => (
					<JournalistCard key={`${user.pk}-${index}`} user={user} />
				))}
			</div>
		</section>
	);
}
