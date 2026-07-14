"use client";

import Link from "next/link";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import { LogoLink } from "./LogoLink";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

export function LoggedInNavigation() {
	const { funcLogout } = useAuthenticatedUser();

	return (
		<header className="border-b border-gray-200 !bg-white">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<LogoLink />

				<div className="flex items-center gap-3">
					<Link
						href="/dashboard"
						className="text-sm text-gray-500 transition-colors hover:text-black"
					>
						Dashboard
					</Link>
					{isPricingReleased ? (
						<Link
							href="/pricing"
							className="text-sm text-gray-500 transition-colors hover:text-black"
						>
							Pricing
						</Link>
					) : null}
					<Button
						type="button"
						strVariant="transparentWithBorder"
						textTransform="none"
						onClick={() => void funcLogout()}
					>
						Sign out
					</Button>
				</div>
			</div>
		</header>
	);
}
