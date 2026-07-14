"use client";

import Link from "next/link";

import { resolveBytescaleDisplayUrl } from "@components/UploadButton";

import { TRADING_NAME } from "@/constants/tradingName";
import { usePublicUser } from "@/hooks/usePublicUser/usePublicUser";
import { profileLinksFromPublicUser } from "@/lib/profileForm";
import type { ProfileLink } from "@/lib/profiles";
import { profilePagePath, publicUserDisplayName } from "@/lib/publicUser";
import { tipTapApiValueToPlainText } from "@/lib/tiptap-utils";

const SHOWCASE_USERNAME = "natashascott";

function LinkIcon({ type }: { type: ProfileLink["type"] }) {
	if (type === "linkedin") {
		return (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				className="size-3 shrink-0 text-gray-400"
				aria-hidden
			>
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

	if (type === "instagram") {
		return (
			<svg
				viewBox="0 0 16 16"
				fill="none"
				className="size-3 shrink-0 text-gray-400"
				aria-hidden
			>
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
			</svg>
		);
	}

	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-3 shrink-0 text-gray-400"
			aria-hidden
		>
			<path
				d="M6.5 9.5a3.5 3.5 0 0 0 5 0l1.5-1.5a3.5 3.5 0 0 0-5-5L7.5 3.5"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
			<path
				d="M9.5 6.5a3.5 3.5 0 0 0-5 0L3 8a3.5 3.5 0 0 0 5 5l.5-.5"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function ProfilePreviewSkeleton() {
	return (
		<div className="grid grid-cols-[30%_1fr] gap-5 p-4 sm:p-5">
			<aside>
				<div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
				<div className="mt-3 h-4 w-24 animate-pulse rounded bg-gray-100" />
				<div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-100" />
				<div className="mt-3 h-7 w-full animate-pulse rounded-lg bg-gray-100" />
			</aside>
			<div className="min-w-0 space-y-2">
				<div className="h-3 w-full animate-pulse rounded bg-gray-100" />
				<div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
				<div className="h-3 w-4/6 animate-pulse rounded bg-gray-100" />
				<div className="mt-4 grid grid-cols-3 gap-1.5">
					{[0, 1, 2].map((key) => (
						<div
							key={key}
							className="aspect-square animate-pulse rounded-lg bg-gray-100"
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export function ProfilePageMockup() {
	const { data: user, isLoading, error } = usePublicUser(SHOWCASE_USERNAME);

	const name = user ? publicUserDisplayName(user) : "";
	const tagline =
		user?.human_profile?.tagline?.trim() ||
		user?.human_profile?.headline?.trim() ||
		"";
	const location = user?.human_profile?.city?.trim() || "";
	const bio =
		tipTapApiValueToPlainText(user?.human_profile?.bio) ||
		tipTapApiValueToPlainText(user?.human_profile?.short_description) ||
		"";
	const links = user ? profileLinksFromPublicUser(user) : [];
	const tags = (user?.tags ?? [])
		.map((tag) => tag.name.trim())
		.filter(Boolean)
		.slice(0, 6);
	const avatarUrl = resolveBytescaleDisplayUrl(
		user?.human_profile?.profile_image_url,
	);
	const galleryUrls = (user?.customusergalleryasset_set ?? [])
		.map((asset) => resolveBytescaleDisplayUrl(asset.asset_url))
		.filter((url): url is string => Boolean(url))
		.slice(0, 3);
	const highlights = [...(user?.profile_links ?? [])].sort(
		(a, b) => a.sort_order - b.sort_order || a.pk - b.pk,
	);

	return (
		<Link
			href={profilePagePath(SHOWCASE_USERNAME)}
			aria-label={name ? `View ${name}'s profile` : "View founder profile"}
			className="block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 transition-shadow hover:shadow-2xl hover:shadow-gray-300/70"
		>
			<div className="border-b border-gray-100 px-4 py-2.5">
				<div className="flex items-center justify-between gap-2">
					<span className="text-[10px] font-medium text-gray-400">← Back</span>
					<span className="text-xs font-semibold text-black">
						{TRADING_NAME || "Publicity"}
					</span>
				</div>
			</div>

			{isLoading ? (
				<ProfilePreviewSkeleton />
			) : !user || error ? (
				<div className="p-8 text-center text-[11px] text-gray-400">
					Profile unavailable
				</div>
			) : (
				<div className="grid grid-cols-[30%_1fr] gap-5 p-4 sm:p-5">
					<aside>
						<div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
							{avatarUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={avatarUrl}
									alt=""
									className="size-full object-cover"
								/>
							) : null}
						</div>
						<p className="mt-3 block text-sm font-bold tracking-tight text-black">
							{name}
						</p>
						{tagline ? (
							<p className="mt-1 block text-[11px] font-bold leading-snug text-gray-600">
								{tagline}
							</p>
						) : null}
						{location ? (
							<p className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500">
								<svg
									viewBox="0 0 16 16"
									fill="none"
									className="size-2.5 shrink-0"
									aria-hidden
								>
									<path
										d="M8 14s4-3 4-7a4 4 0 1 0-8 0c0 4 4 7 4 7Z"
										stroke="currentColor"
										strokeWidth="1.25"
									/>
									<circle cx="8" cy="7" r="1" fill="currentColor" />
								</svg>
								{location}
							</p>
						) : null}
						<div className="mt-3 w-full rounded-lg bg-[#FF00AE] px-2 py-1.5 text-center text-[10px] font-medium text-white">
							Contact for media
						</div>
						{links.length > 0 ? (
							<ul className="mt-2 space-y-1">
								{links.map((link) => (
									<li
										key={`${link.type}-${link.href}`}
										className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5 text-[10px] text-gray-600"
									>
										<LinkIcon type={link.type} />
										<span className="truncate">{link.label}</span>
									</li>
								))}
							</ul>
						) : null}
						{tags.length > 0 ? (
							<div className="mt-3">
								<p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
									I speak about
								</p>
								<ul className="mt-1.5 flex flex-wrap gap-1">
									{tags.map((tag) => (
										<li
											key={tag}
											className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] text-gray-600"
										>
											{tag}
										</li>
									))}
								</ul>
							</div>
						) : null}
					</aside>

					<div className="min-w-0">
						{bio ? (
							<div className="max-h-[12.5rem] overflow-hidden text-[11px] leading-relaxed text-gray-600">
								{bio.split("\n").map((line, index) => {
									const isTitleOrHeadline = line === name || line === tagline;
									return (
										<p
											key={`${index}-${line.slice(0, 24)}`}
											className={
												isTitleOrHeadline ? "font-bold text-black" : undefined
											}
										>
											{line}
										</p>
									);
								})}
							</div>
						) : null}
						{galleryUrls.length > 0 ? (
							<div className="mt-4 grid grid-cols-3 gap-1.5">
								{galleryUrls.map((src) => (
									<div
										key={src}
										className="aspect-square overflow-hidden rounded-lg bg-gray-100"
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={src} alt="" className="size-full object-cover" />
									</div>
								))}
							</div>
						) : null}
						{highlights.length > 0 ? (
							<div className="mt-4">
								<p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
									Highlights
								</p>
								<ul className="mt-1.5 divide-y divide-gray-50 overflow-hidden rounded-lg border border-gray-100">
									{highlights.map((item) => (
										<li
											key={item.pk}
											className="flex items-start gap-2 px-2.5 py-2"
										>
											<div className="min-w-0 flex-1">
												<p className="text-[10px] leading-snug">
													<span className="font-semibold text-black">
														{item.publication}
													</span>
													<span className="text-gray-500">
														{" "}
														— &ldquo;{item.title}&rdquo;
													</span>
												</p>
											</div>
											{item.year != null ? (
												<span className="shrink-0 text-[9px] text-gray-400">
													{item.year}
												</span>
											) : null}
										</li>
									))}
								</ul>
							</div>
						) : null}
					</div>
				</div>
			)}
		</Link>
	);
}
