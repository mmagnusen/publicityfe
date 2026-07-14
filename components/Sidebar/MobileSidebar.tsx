"use client";

import { SidebarContent } from "./SidebarContent";
import { useSidebar } from "./SidebarProvider";

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

export function MobileSidebar() {
	const { closeSidebar, isSidebarOpen } = useSidebar();

	if (!isSidebarOpen) {
		return null;
	}

	return (
		<>
			<button
				type="button"
				aria-label="Close navigation menu"
				className="fixed inset-0 z-40 bg-black/40 md:hidden"
				onClick={closeSidebar}
			/>
			<aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col !bg-white shadow-xl md:hidden">
				<div className="flex justify-end border-b border-gray-200 px-4 py-3">
					<button
						type="button"
						aria-label="Close navigation menu"
						className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
						onClick={closeSidebar}
					>
						<CloseIcon />
					</button>
				</div>
				<div className="min-h-0 flex-1">
					<SidebarContent />
				</div>
			</aside>
		</>
	);
}
