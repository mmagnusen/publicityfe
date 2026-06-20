import type { Metadata } from "next";

import { EditTag } from "@/components/pages/AdminTags/EditTag";

export const metadata: Metadata = {
	title: "Edit tag — Admin — Spotlight",
	description: "Edit a tag in Spotlight.",
};

export default function AdminEditTagPage() {
	return <EditTag />;
}
