"use client";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import { LogoLink } from "@/components/Navigation/LogoLink";
import { DASHBOARD_HEADER_HEIGHT } from "./constants";
import { useSidebar } from "./SidebarProvider";

function MenuIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
			<title>Menu</title>
			<path
				d="M4 7h16M4 12h16M4 17h16"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function DashboardHeader() {
	const { authenticatedUser } = useAuthenticatedUser();
	const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

	return (
		<header
			className="fixed top-0 right-0 left-0 z-30 border-b border-gray-200 bg-white"
			style={{ height: DASHBOARD_HEADER_HEIGHT }}
		>
			<div className="flex h-full items-center justify-between px-6">
				<LogoLink />

				<div className="flex items-center gap-3 sm:gap-4">
					{authenticatedUser ? (
						<>
							<Button
								className="hidden sm:inline-flex"
								href="/create-opportunity"
								size="small"
								textTransform="none"
							>
								Post an opportunity
							</Button>
							<span className="hidden text-sm text-gray-600 sm:inline">
								{authenticatedUser.firstName}
							</span>
						</>
					) : null}
					<button
						type="button"
						aria-expanded={isSidebarOpen}
						aria-label="Open navigation menu"
						className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
						onClick={() => setIsSidebarOpen(true)}
					>
						<MenuIcon />
					</button>
				</div>
			</div>
		</header>
	);
}
