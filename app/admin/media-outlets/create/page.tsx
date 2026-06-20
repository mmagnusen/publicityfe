import type { Metadata } from "next";

import { CreateMediaOutlet } from "@/components/pages/AdminMediaOutlets/CreateMediaOutlet";

export const metadata: Metadata = {
	title: "New media outlet — Admin — Spotlight",
	description: "Create a new media outlet in Spotlight.",
};

export default function AdminCreateMediaOutletPage() {
	return <CreateMediaOutlet />;
}
