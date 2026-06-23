import type { Metadata } from "next";

import { FavouritesContent } from "@/components/favourites-content";

export const metadata: Metadata = {
	title: "Favourites — Spotlight",
	description: "Your saved media opportunities.",
};

export default function FavouritesPage() {
	return <FavouritesContent />;
}
