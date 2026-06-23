"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

type SidebarNavLinkProps = {
	children: React.ReactNode;
	href: string;
	onNavigate?: () => void;
};

function isActivePath(pathname: string, href: string) {
	if (href === "/dashboard" || href === "/opportunity") {
		return pathname === href;
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNavLink({
	children,
	href,
	onNavigate,
}: SidebarNavLinkProps) {
	const pathname = usePathname();
	const isActive = isActivePath(pathname, href);

	return (
		<Link
			href={href}
			onClick={onNavigate}
			className={cn(
				"block rounded-md px-4 py-2 text-sm font-medium transition-colors",
				isActive
					? "bg-gray-100 text-black"
					: "text-gray-600 hover:bg-gray-50 hover:text-black",
			)}
		>
			{children}
		</Link>
	);
}
