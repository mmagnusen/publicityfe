import type { Metadata } from "next";

import { CreateTag } from "@/components/pages/AdminTags/CreateTag";

export const metadata: Metadata = {
	title: "New tag — Admin — Spotlight",
	description: "Create a new tag in Spotlight.",
};

export default function AdminCreateTagPage() {
	return <CreateTag />;
}
