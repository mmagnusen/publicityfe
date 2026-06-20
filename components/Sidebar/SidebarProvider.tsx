"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

type SidebarContextValue = {
	closeSidebar: () => void;
	isSidebarOpen: boolean;
	setIsSidebarOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

	const value = useMemo(
		() => ({
			closeSidebar,
			isSidebarOpen,
			setIsSidebarOpen,
		}),
		[closeSidebar, isSidebarOpen],
	);

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within SidebarProvider");
	}
	return context;
}
