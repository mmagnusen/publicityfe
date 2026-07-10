"use client";

import {
	mdiAccountGroupOutline,
	mdiAccountOutline,
	mdiBriefcaseOutline,
	mdiClipboardTextOutline,
	mdiClockOutline,
	mdiCreditCardOutline,
	mdiExitToApp,
	mdiGiftOutline,
	mdiHeartOutline,
	mdiInboxArrowDownOutline,
	mdiMagnify,
	mdiNewspaperVariantOutline,
	mdiPlusCircleOutline,
	mdiTagOutline,
	mdiTagTextOutline,
	mdiViewDashboardOutline,
} from "@mdi/js";
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
			<section className="mb-8 px-4">
				<SectionHeader className="py-2" title="Overview" />
				<ul className="list-none">
					<li className="py-1">
						<SidebarNavLink
							href="/dashboard"
							icon={mdiViewDashboardOutline}
							onNavigate={onNavigate}
						>
							Dashboard
						</SidebarNavLink>
					</li>
				</ul>
			</section>

			<section className="mb-8 px-4">
				<SectionHeader className="py-2" title="Opportunities" />
				<ul className="list-none">
					<li className="py-1">
						<SidebarNavLink
							href="/create-opportunity"
							icon={mdiPlusCircleOutline}
							onNavigate={onNavigate}
						>
							Post an opportunity
						</SidebarNavLink>
					</li>
					<li className="py-1">
						<SidebarNavLink
							href="/applications-received"
							icon={mdiInboxArrowDownOutline}
							onNavigate={onNavigate}
						>
							Applications received
						</SidebarNavLink>
					</li>
					<li className="py-1">
						<SidebarNavLink
							href="/opportunity"
							icon={mdiMagnify}
							onNavigate={onNavigate}
						>
							Browse opportunities
						</SidebarNavLink>
					</li>
					<li className="py-1">
						<SidebarNavLink
							href="/favourites"
							icon={mdiHeartOutline}
							onNavigate={onNavigate}
						>
							My favourites
						</SidebarNavLink>
					</li>
				</ul>
			</section>

			<section className="mb-8 px-4">
				<SectionHeader className="py-2" title="My account" />
				<ul className="list-none">
					<li className="py-1">
						{profileHref ? (
							<SidebarNavLink
								href={profileHref}
								icon={mdiAccountOutline}
								onNavigate={onNavigate}
							>
								View profile
							</SidebarNavLink>
						) : (
							<div className="px-2 py-2">
								<Skeleton width="100%" height="20px" />
							</div>
						)}
					</li>
				</ul>
			</section>

			{isAdmin ? (
				<section className="mb-8 px-4">
					<SectionHeader className="py-2" title="Admin" />
					<ul className="list-none">
						<li className="py-1">
							<SidebarNavLink
								href="/admin/opportunity"
								icon={mdiBriefcaseOutline}
								onNavigate={onNavigate}
							>
								All opportunities
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/admin/applications"
								icon={mdiClipboardTextOutline}
								onNavigate={onNavigate}
							>
								All applications
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/admin/media-outlets"
								icon={mdiNewspaperVariantOutline}
								onNavigate={onNavigate}
							>
								Media Outlets
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/admin/tags"
								icon={mdiTagOutline}
								onNavigate={onNavigate}
							>
								Tags
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/admin/waitlist"
								icon={mdiClockOutline}
								onNavigate={onNavigate}
							>
								Waitlist
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/admin/users"
								icon={mdiAccountGroupOutline}
								onNavigate={onNavigate}
							>
								Users
							</SidebarNavLink>
						</li>
					</ul>
				</section>
			) : null}

			{isPricingReleased ? (
				<section className="px-4">
					<SectionHeader className="py-2" title="Account" />
					<ul className="list-none">
						<li className="py-1">
							<SidebarNavLink
								href="/pricing"
								icon={mdiTagTextOutline}
								onNavigate={onNavigate}
							>
								Pricing
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/billing"
								icon={mdiCreditCardOutline}
								onNavigate={onNavigate}
							>
								Billing
							</SidebarNavLink>
						</li>
						<li className="py-1">
							<SidebarNavLink
								href="/referrals"
								icon={mdiGiftOutline}
								onNavigate={onNavigate}
							>
								Referrals
							</SidebarNavLink>
						</li>
					</ul>
				</section>
			) : null}

			<section className="px-4">
				<ul className="list-none">
					<li className="mt-4 border-t border-gray-200 pt-4">
						<button
							type="button"
							onClick={() => {
								onNavigate();
								void funcLogout();
							}}
							className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-black"
						>
							<span className="flex size-5 shrink-0 items-center justify-center">
								<Icon
									horizontal
									path={mdiExitToApp}
									rotate={180}
									size={0.85}
									vertical
								/>
							</span>
							Sign out
						</button>
					</li>
				</ul>
			</section>
		</div>
	);
}
