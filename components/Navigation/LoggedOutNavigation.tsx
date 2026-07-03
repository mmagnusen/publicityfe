import Link from "next/link";

import Button from "@/components/Button";
import { LogoLink } from "./LogoLink";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

const navLinks = [
	{ href: "#features", label: "Features" },
	{ href: "#how-it-works", label: "How it Works" },
	...(isPricingReleased ? [{ href: "/pricing", label: "Pricing" }] : []),
	{ href: "/opportunity", label: "Opportunities" },
];

export function LoggedOutNavigation() {
	return (
		<header className="border-b border-gray-200 bg-white">
			<div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<LogoLink />

				<nav
					aria-label="Main"
					className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
				>
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm text-gray-500 transition-colors hover:text-black"
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-3">
					{isPricingReleased ? (
						<Link
							href="/pricing"
							className="text-sm text-gray-500 transition-colors hover:text-black md:hidden"
						>
							Pricing
						</Link>
					) : null}
					<Button
						href="/login"
						strVariant="transparentWithBorder"
						textTransform="none"
					>
						Sign In
					</Button>
					<Button href="/register" textTransform="none">
						Get Started
					</Button>
				</div>
			</div>
		</header>
	);
}
