"use client";

import Link from "next/link";

import type { PublicUser } from "@customTypes/publicUser";
import {
	publicUserDisplayName,
	useFeaturedJournalists,
} from "@hooks/useFeaturedJournalists";

import { FEATURED_JOURNALIST_USERNAMES } from "@/constants/featuredJournalists";
import { profilePagePath } from "@/lib/publicUser";

function JournalistCard({ user }: { user: PublicUser }) {
	const name = publicUserDisplayName(user);
	const imageUrl = user.human_profile?.profile_image_url?.trim();
	const href = user.username?.trim() ? profilePagePath(user.username) : null;

	if (!href) {
		return null;
	}

	return (
		<Link
			href={href}
			className="relative aspect-4/5 overflow-hidden rounded-xl sm:rounded-2xl"
		>
			{imageUrl ? (
				// Profile images come from Bytescale CDN URLs — not in next/image config.
				// eslint-disable-next-line @next/next/no-img-element
				<img src={imageUrl} alt={name} className="size-full object-cover" />
			) : (
				<div className="flex size-full items-center justify-center bg-gray-200 text-2xl font-semibold text-gray-500">
					{name.charAt(0).toUpperCase() || "?"}
				</div>
			)}
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-white via-white/80 to-transparent"
				aria-hidden
			/>
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
		<section className="bg-white px-6 pb-0 pt-4 sm:pt-6">
			<div className="mx-auto grid w-full max-w-5xl grid-cols-3 gap-2 sm:gap-3">
				{journalists.map((user) => (
					<JournalistCard key={user.pk} user={user} />
				))}
			</div>
		</section>
	);
}
