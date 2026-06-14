import type { ReactNode } from "react";
import Link from "next/link";

import Heading from "@/components/Heading";
import Text from "@/components/Text";

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

type AuthPageShellProps = {
	title: string;
	description: string;
	children: ReactNode;
	footer: ReactNode;
};

export function AuthPageShell({
	title,
	description,
	children,
	footer,
}: AuthPageShellProps) {
	return (
		<div className="flex min-h-full flex-col bg-white font-sans">
			<header className="border-b border-gray-200 px-6 py-4">
				<Link href="/" className="inline-flex items-center gap-2.5">
					<LogoIcon />
					<span className="text-lg font-semibold tracking-tight text-black">
						Spotlight
					</span>
				</Link>
			</header>

			<main className="flex flex-1 items-center justify-center px-6 py-12">
				<div className="w-full max-w-md">
					<div className="text-center">
						<Heading level={1}>{title}</Heading>
						<Text variant="auth-description">{description}</Text>
					</div>

					<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
						{children}
					</div>

					<Text variant="auth-footer">{footer}</Text>
				</div>
			</main>
		</div>
	);
}
