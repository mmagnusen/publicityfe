"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@mdi/react";

import { cn } from "@/lib/cn";

type SidebarNavLinkProps = {
	children: React.ReactNode;
	href: string;
	icon?: string;
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
	icon,
	onNavigate,
}: SidebarNavLinkProps) {
	const pathname = usePathname();
	const isActive = isActivePath(pathname, href);

	return (
		<Link
			href={href}
			onClick={onNavigate}
			className={cn(
				"flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors",
				isActive
					? "bg-gray-100 text-black"
					: "text-gray-600 hover:bg-gray-50 hover:text-black",
			)}
		>
			{icon ? (
				<span className="flex size-5 shrink-0 items-center justify-center">
					<Icon horizontal path={icon} rotate={180} size={0.85} vertical />
				</span>
			) : null}
			<span className="min-w-0">{children}</span>
		</Link>
	);
}
