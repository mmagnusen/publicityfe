import Link from "next/link";
import { mdiInstagram, mdiLinkedin } from "@mdi/js";
import Icon from "@mdi/react";

import { LogoLink } from "@/components/Navigation/LogoLink";
import {
	INSTAGRAM_PROFILE_URL,
	LINKEDIN_PROFILE_URL,
	SITE_NAME,
} from "@/constants/socialMedia";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

const footerLinks = [
	{ href: "/contact-us", label: "Contact us" },
	...(isPricingReleased ? [{ href: "/pricing", label: "Pricing" }] : []),
	{ href: "/terms-and-conditions", label: "Terms and conditions" },
	{ href: "/privacy-policy", label: "Privacy policy" },
] as const;

const socialLinks = [
	{
		href: INSTAGRAM_PROFILE_URL,
		icon: mdiInstagram,
		label: "Instagram",
	},
	{
		href: LINKEDIN_PROFILE_URL,
		icon: mdiLinkedin,
		label: "LinkedIn",
	},
] as const;

export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-gray-200 bg-white px-6 py-12 sm:py-16">
			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-sm">
						<LogoLink />
						<p className="mt-4 text-sm leading-relaxed text-gray-500">
							Connect with journalists, podcast hosts, and event organizers
							actively looking for experts like you.
						</p>
					</div>

					<div className="grid gap-10 sm:grid-cols-2 sm:gap-12">
						<div>
							<h2 className="text-sm font-semibold text-gray-900">Company</h2>
							<ul className="mt-4 list-none space-y-3">
								{footerLinks.map((link) => (
									<li key={link.href}>
										<Link
											className="text-sm text-[#16140F] transition-colors hover:text-[#FF00AE]"
											href={link.href}
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h2 className="text-sm font-semibold text-gray-900">Follow us</h2>
							<ul className="mt-4 list-none space-y-3">
								{socialLinks.map((link) => (
									<li key={link.label}>
										<a
											className="inline-flex items-center gap-2 text-sm text-[#16140F] transition-colors hover:text-[#FF00AE]"
											href={link.href}
											rel="noopener noreferrer"
											target="_blank"
										>
											<Icon
												horizontal
												path={link.icon}
												rotate={180}
												size={0.85}
												vertical
											/>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<p className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-400">
					&copy; {year} {SITE_NAME}. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
