import { TRADING_NAME } from "@/constants/tradingName";

const MOCK_PROFILE = {
	name: "Sarah Mitchell",
	tagline: "Founder & CEO, Bloom Cosmetics",
	location: "London, UK",
	bio: "Sarah built Bloom Cosmetics from her kitchen table into a £12M skincare brand stocked in Selfridges and Cult Beauty. She speaks on clean beauty, female entrepreneurship, and building a brand without outside funding.",
	tags: ["Skincare", "Beauty", "Entrepreneurship"],
	links: [
		{ label: "LinkedIn", type: "linkedin" as const },
		{ label: "Instagram", type: "instagram" as const },
	],
};

function MockLinkIcon({ type }: { type: "linkedin" | "instagram" }) {
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
			<circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.25" />
		</svg>
	);
}

export function ProfilePageMockup() {
	return (
		<div
			aria-hidden
			className="pointer-events-none select-none overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60"
		>
			<div className="border-b border-gray-100 px-4 py-2.5">
				<div className="flex items-center justify-between gap-2">
					<span className="text-[10px] font-medium text-gray-400">← Back</span>
					<span className="text-xs font-semibold text-black">
						{TRADING_NAME || "Publicity"}
					</span>
				</div>
			</div>

			<div className="grid gap-4 p-4 sm:grid-cols-[108px_1fr] sm:gap-5 sm:p-5">
				<aside>
					<div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/gallery/interview.jpg"
							alt=""
							className="size-full object-cover"
						/>
					</div>
					<p className="mt-3 text-sm font-bold tracking-tight text-black">
						{MOCK_PROFILE.name}
					</p>
					<p className="mt-0.5 text-[11px] leading-snug text-gray-600">
						{MOCK_PROFILE.tagline}
					</p>
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
						{MOCK_PROFILE.location}
					</p>
					<div className="mt-3 w-full rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-500 px-2 py-1.5 text-center text-[10px] font-medium text-white">
						Contact for media
					</div>
					<ul className="mt-2 space-y-1">
						{MOCK_PROFILE.links.map((link) => (
							<li
								key={link.label}
								className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5 text-[10px] text-gray-600"
							>
								<MockLinkIcon type={link.type} />
								<span className="truncate">{link.label}</span>
							</li>
						))}
					</ul>
					<div className="mt-3">
						<p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
							Speaks about
						</p>
						<ul className="mt-1.5 flex flex-wrap gap-1">
							{MOCK_PROFILE.tags.map((tag) => (
								<li
									key={tag}
									className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] text-gray-600"
								>
									{tag}
								</li>
							))}
						</ul>
					</div>
				</aside>

				<div className="min-w-0">
					<p className="text-[11px] leading-relaxed text-gray-600">
						{MOCK_PROFILE.bio}
					</p>
					<div className="mt-4 grid grid-cols-3 gap-1.5">
						{[
							"/gallery/studio.jpg",
							"/gallery/conference.jpg",
							"/gallery/podcaster.jpg",
						].map((src) => (
							<div
								key={src}
								className="aspect-square overflow-hidden rounded-lg bg-gray-100"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={src} alt="" className="size-full object-cover" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
