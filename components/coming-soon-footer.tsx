import { mdiInstagram, mdiLinkedin } from "@mdi/js";
import Icon from "@mdi/react";

import {
	INSTAGRAM_PROFILE_URL,
	LINKEDIN_PROFILE_URL,
} from "@/constants/socialMedia";

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

export function ComingSoonFooter() {
	return (
		<footer className="border-t border-gray-200 bg-white px-6 py-8">
			<ul className="mx-auto flex list-none items-center justify-center gap-6">
				{socialLinks.map((link) => (
					<li key={link.label}>
						<a
							className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-black"
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
		</footer>
	);
}
