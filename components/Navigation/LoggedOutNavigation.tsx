"use client";

import { useState } from "react";
import Link from "next/link";

import Button from "@/components/Button";
import { LogoLink } from "./LogoLink";
import { MobileNavSidebar } from "./MobileNavSidebar";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

const navLinks = [
	{ href: "#features", label: "Features" },
	{ href: "#how-it-works", label: "How it Works" },
	...(isPricingReleased ? [{ href: "/pricing", label: "Pricing" }] : []),
	{ href: "/opportunity", label: "Opportunities" },
];

function HamburgerIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
			<title>Open menu</title>
			<path
				d="M4 6h16M4 12h16M4 18h16"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function LoggedOutNavigation() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<header className="border-b border-gray-200 bg-white">
			<MobileNavSidebar
				isOpen={isMobileMenuOpen}
				navLinks={navLinks}
				onClose={() => setIsMobileMenuOpen(false)}
			/>
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
					<div className="hidden items-center gap-3 md:flex">
						<Button
							href="/login"
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							Sign In
						</Button>
						<Button href="/register" textTransform="none">
							Get started for free
						</Button>
					</div>
					<button
						type="button"
						aria-expanded={isMobileMenuOpen}
						aria-label={
							isMobileMenuOpen
								? "Close navigation menu"
								: "Open navigation menu"
						}
						className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black md:hidden"
						onClick={() => setIsMobileMenuOpen((open) => !open)}
					>
						{isMobileMenuOpen ? (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								className="size-5"
								aria-hidden
							>
								<title>Close menu</title>
								<path
									d="M6 6l12 12M18 6L6 18"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
								/>
							</svg>
						) : (
							<HamburgerIcon />
						)}
					</button>
				</div>
			</div>
		</header>
	);
}
