import type { Metadata } from "next";

import { FavouritesContent } from "@/components/favourites-content";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Favourites- ${TRADING_NAME}`,
	description: "Your saved media opportunities.",
};

export default function FavouritesPage() {
	return <FavouritesContent />;
}
