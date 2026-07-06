"use client";

import { useEffect } from "react";
import Link from "next/link";

import Button from "@/components/Button";
import { LogoLink } from "./LogoLink";

function CloseIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
			<title>Close menu</title>
			<path
				d="M6 6l12 12M18 6L6 18"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

type NavLink = {
	href: string;
	label: string;
};

type MobileNavSidebarProps = {
	isOpen: boolean;
	navLinks: NavLink[];
	onClose: () => void;
};

export function MobileNavSidebar({
	isOpen,
	navLinks,
	onClose,
}: MobileNavSidebarProps) {
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	return (
		<>
			<button
				type="button"
				aria-label="Close navigation menu"
				className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 md:hidden ${
					isOpen ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
				onClick={onClose}
				tabIndex={isOpen ? 0 : -1}
			/>
			<aside
				aria-hidden={!isOpen}
				className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
					<LogoLink />
					<button
						type="button"
						aria-label="Close navigation menu"
						className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
						onClick={onClose}
					>
						<CloseIcon />
					</button>
				</div>
				<nav aria-label="Mobile" className="flex flex-col gap-1 px-6 py-4">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
							onClick={onClose}
							tabIndex={isOpen ? 0 : -1}
						>
							{link.label}
						</Link>
					))}
				</nav>
				<div className="mt-auto flex flex-col gap-3 border-t border-gray-200 px-6 py-4">
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
			</aside>
		</>
	);
}
