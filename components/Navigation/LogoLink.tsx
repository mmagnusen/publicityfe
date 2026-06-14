import Link from "next/link";

function LogoIcon() {
	return (
		<div className="flex size-8 items-center justify-center rounded-lg bg-black">
			<svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
				<title>Trending chart</title>
				<path
					d="M3 11L6.5 7.5L9 9.5L13 4"
					stroke="white"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}

export function LogoLink() {
	return (
		<Link href="/" className="flex items-center gap-2.5">
			<LogoIcon />
			<span className="text-lg font-semibold tracking-tight text-black">
				Spotlight
			</span>
		</Link>
	);
}
