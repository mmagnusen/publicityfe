"use client";

import type { ReactNode } from "react";

import useMedia from "@hooks/useMedia";

import { DASHBOARD_HEADER_HEIGHT } from "./constants";
import { DashboardHeader } from "./DashboardHeader";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { SidebarProvider } from "./SidebarProvider";

type SidebarLayoutProps = {
	children: ReactNode;
};

function SidebarLayoutContent({ children }: SidebarLayoutProps) {
	const isMobile = useMedia("(max-width: 768px)");

	return (
		<div className="min-h-dvh bg-gray-50 font-sans">
			<DashboardHeader />
			{isMobile ? <MobileSidebar /> : <DesktopSidebar />}
			<main
				className="md:ml-[250px]"
				style={{
					paddingTop: DASHBOARD_HEADER_HEIGHT,
				}}
			>
				<div
					className="mx-auto max-w-6xl px-6 py-10"
					style={{
						minHeight: `calc(100dvh - ${DASHBOARD_HEADER_HEIGHT}px)`,
					}}
				>
					{children}
				</div>
			</main>
		</div>
	);
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
	return (
		<SidebarProvider>
			<SidebarLayoutContent>{children}</SidebarLayoutContent>
		</SidebarProvider>
	);
}
