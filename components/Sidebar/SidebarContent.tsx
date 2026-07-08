"use client";

import { mdiExitToApp } from "@mdi/js";
import Icon from "@mdi/react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Skeleton from "@/components/Skeletons/Skeleton";
import { profilePagePath } from "@/lib/publicUser";
import { SectionHeader } from "./SectionHeader";
import { SidebarNavLink } from "./SidebarNavLink";
import { useSidebar } from "./SidebarProvider";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

export function SidebarContent() {
	const { authenticatedUser, funcLogout, isAdmin } = useAuthenticatedUser();
	const { closeSidebar } = useSidebar();

	const onNavigate = () => {
		closeSidebar();
	};

	const profileHref = authenticatedUser?.username?.trim()
		? profilePagePath(authenticatedUser.username)
		: null;

	return (
		<div className="h-full overflow-y-auto bg-white pb-20 md:pb-12">
			<section className="mb-8">
				<div className="px-4 py-2">
					<SectionHeader title="Overview" />
				</div>
				<ul className="list-none">
					<li className="py-1">
						<SidebarNavLink href="/dashboard" onNavigate={onNavigate}>
							Dashboard
						</SidebarNavLink>
					</li>
				</ul>
			</section>

			<section className="mb-8">
				<div className="px-4 py-2">
					<SectionHeader title="Opportunities" />
				</div>
				<ul className="list-none">
					<li className="py-1">
						<SidebarNavLink href="/create-opportunity" onNavigate={onNavigate}>
							Post an opportunity
						</SidebarNavLink>
					</li>
					<li className="py-1">
						<SidebarNavLink href="/opportunity" onNavigate={onNavigate}>
							Browse opportunities
						</SidebarNavLink>
					</li>
					<li className="py-1">
						<SidebarNavLink href="/favourites" onNavigate={onNavigate}>
							My favourites
						</SidebarNavLink>
					</li>
				</ul>
			</section>

			<section className="mb-8">
				<div className="px-4 py-2">
					<SectionHeader title="My account" />
				</div>
				<ul className="list-none">
					<li className="py-1">
						{profileHref ? (
							<SidebarNavLink href={profileHref} onNavigate={onNavigate}>
								View profile
							</SidebarNavLink>
						) : (
							<div className="px-4 py-2">
								<Skeleton width="100%" height="20px" />
							</div>
						)}
					</li>
				</ul>
			</section>

			{isAdmin ? (
				<section className="mb-8">
					<div className="px-4 py-2">
						<SectionHeader title="Admin" />
					</div>
					<ul className="list-none">
						<li className="py-1">
							<SidebarNavLink href="/admin/opportunity" onNavigate={onNavigate}>
								All opportunities
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/admin/applications"
								onNavigate={onNavigate}
							>
								All applications
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/admin/media-outlets"
								onNavigate={onNavigate}
							>
								Media Outlets
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink href="/admin/tags" onNavigate={onNavigate}>
								Tags
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink href="/admin/waitlist" onNavigate={onNavigate}>
								Waitlist
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink href="/admin/users" onNavigate={onNavigate}>
								Users
							</SidebarNavLink>
						</li>
					</ul>
				</section>
			) : null}

			{isPricingReleased ? (
				<section>
					<div className="px-4 py-2">
						<SectionHeader title="Account" />
					</div>
					<ul className="list-none">
						<li className="py-1">
							<SidebarNavLink href="/pricing" onNavigate={onNavigate}>
								Pricing
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink href="/billing" onNavigate={onNavigate}>
								Billing
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink href="/referrals" onNavigate={onNavigate}>
								Referrals
							</SidebarNavLink>
						</li>
					</ul>
				</section>
			) : null}

			<section>
				<ul className="list-none">
					<li className="mt-4 border-t border-gray-200 pt-4">
						<button
							type="button"
							onClick={() => {
								onNavigate();
								void funcLogout();
							}}
							className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-black"
						>
							<Icon horizontal path={mdiExitToApp} rotate={180} size={0.8} />
							Sign out
						</button>
					</li>
				</ul>
			</section>
		</div>
	);
}
