import Image from "next/image";
import Link from "next/link";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import type { FounderProfile, ProfileLink } from "@/lib/profiles";

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

type FounderProfileDetailProps = {
	profile: FounderProfile;
};

export function FounderProfileDetail({ profile }: FounderProfileDetailProps) {
	return (
		<div className="min-h-full bg-white font-sans">
			<header className="border-b border-gray-200 px-6 py-4">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<Link
						href="/"
						className="text-sm font-medium text-gray-500 transition-colors hover:text-black"
					>
						← Back
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
				<div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
					<aside>
						<div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
							<Image
								src={profile.avatarUrl}
								alt={profile.name}
								fill
								sizes="280px"
								className="object-cover"
								priority
							/>
						</div>

						<Heading level={1} variant="page-profile">
							{profile.name}
						</Heading>
						<Text variant="profile-role">
							{profile.role},{" "}
							<span className="font-semibold text-black">
								{profile.company}
							</span>
						</Text>
						<Text variant="profile-location">
							<MapPinIcon />
							{profile.location}
						</Text>

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

						<ul className="mt-4 space-y-2">
							{profile.links.map((link) => (
								<li key={`${link.type}-${link.label}`}>
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

						<div className="mt-8">
							<Text variant="label">Speaks about</Text>
							<ul className="mt-3 flex flex-wrap gap-2">
								{profile.topics.map((topic) => (
									<li
										key={topic}
										className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
									>
										{topic}
									</li>
								))}
							</ul>
						</div>
					</aside>

					<div>
						{profile.openToMedia && (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
								<span className="size-1.5 rounded-full bg-violet-500" />
								Open to media opportunities
							</span>
						)}

						<div className="mt-6 space-y-4 text-base leading-relaxed text-gray-600">
							{profile.bio.map((paragraph) => (
								<Text key={paragraph} variant="plain">
									{paragraph}
								</Text>
							))}
						</div>

						<section className="mt-10">
							<Heading level={2} variant="label">
								Gallery
							</Heading>
							<div className="mt-4 grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[140px] sm:grid-cols-3">
								{profile.gallery.map((image) => (
									<div
										key={image.src}
										className={`relative overflow-hidden rounded-2xl bg-gray-100 ${image.className ?? ""}`}
									>
										<Image
											src={image.src}
											alt={image.alt}
											fill
											sizes="(max-width: 640px) 50vw, 240px"
											className="object-cover"
										/>
									</div>
								))}
							</div>
						</section>

						<section className="mt-10">
							<Heading level={2} variant="label">
								Featured in
							</Heading>
							<ul className="mt-4 divide-y divide-gray-200 rounded-2xl border border-gray-200">
								{profile.featuredIn.map((item) => (
									<li key={`${item.publication}-${item.year}`}>
										<a
											href={item.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
										>
											<div className="min-w-0 flex-1">
												<Text variant="sm">
													<span className="font-semibold text-black">
														{item.publication}
													</span>
													<span className="text-gray-500">
														{" "}
														&mdash; &ldquo;{item.title}&rdquo;
													</span>
												</Text>
											</div>
											<div className="flex shrink-0 items-center gap-3">
												<span className="text-sm text-gray-400">
													{item.year}
												</span>
												<ExternalLinkIcon />
											</div>
										</a>
									</li>
								))}
							</ul>
						</section>
					</div>
				</div>
			</main>
		</div>
	);
}
