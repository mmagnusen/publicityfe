import { DASHBOARD_HEADER_HEIGHT, DESKTOP_SIDEBAR_WIDTH } from "./constants";
import { SidebarContent } from "./SidebarContent";

export function DesktopSidebar() {
	return (
		<aside
			className="fixed left-0 flex flex-col border-r border-gray-200 !bg-white shadow-sm"
			style={{
				top: DASHBOARD_HEADER_HEIGHT,
				width: DESKTOP_SIDEBAR_WIDTH,
				height: `calc(100dvh - ${DASHBOARD_HEADER_HEIGHT}px)`,
				backgroundColor: "#ffffff",
			}}
		>
			<SidebarContent />
		</aside>
	);
}
