import type { Metadata } from "next";

import { EditMediaOutlet } from "@/components/pages/AdminMediaOutlets/EditMediaOutlet";

export const metadata: Metadata = {
	title: "Edit media outlet — Admin — Spotlight",
	description: "Edit a media outlet in Spotlight.",
};

export default function AdminEditMediaOutletPage() {
	return <EditMediaOutlet />;
}
