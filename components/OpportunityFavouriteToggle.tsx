"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mdiHeart, mdiHeartOutline } from "@mdi/js";
import Icon from "@mdi/react";

import Tooltip from "@components/Tooltip";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { useOpportunityFavourites } from "@hooks/useOpportunityFavourites";

import Button from "@/components/Button";
import { cn } from "@/lib/cn";

type Props = {
	opportunityId: number;
	isFavorited: boolean;
	variant?: "icon" | "button";
	className?: string;
};

export function OpportunityFavouriteToggle({
	opportunityId,
	isFavorited: initialIsFavorited,
	variant = "icon",
	className,
}: Props) {
	const router = useRouter();
	const { isLoggedIn } = useAuthenticatedUser();
	const { setOpportunityFavorite } = useOpportunityFavourites();
	const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		setIsFavorited(initialIsFavorited);
	}, [initialIsFavorited]);

	const handleToggle = async (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		if (!isLoggedIn) {
			router.push("/login");
			return;
		}

		if (isUpdating) {
			return;
		}

		const nextValue = !isFavorited;
		setIsFavorited(nextValue);
		setIsUpdating(true);

		try {
			await setOpportunityFavorite(opportunityId, nextValue);
		} catch {
			setIsFavorited(!nextValue);
		} finally {
			setIsUpdating(false);
		}
	};

	const tooltipContent = !isLoggedIn
		? "Log in to add to favourites"
		: isFavorited
			? "Remove from favourites"
			: "Add to favourites";

	if (variant === "button") {
		return (
			<Button
				borderRadius="large"
				className={className}
				isDisabled={isUpdating}
				onClick={handleToggle}
				strVariant="transparentWithBorder"
				textTransform="none"
				type="button"
			>
				<span className="inline-flex items-center justify-center gap-2">
					<Icon
						horizontal
						path={isFavorited ? mdiHeart : mdiHeartOutline}
						rotate={180}
						size={0.8}
						vertical
					/>
					{isFavorited ? "Remove from favourites" : "Add to favourites"}
				</span>
			</Button>
		);
	}

	return (
		<Tooltip tooltipContent={tooltipContent}>
			<button
				aria-label={tooltipContent}
				className={cn(
					"inline-flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-pink-600 transition-colors hover:border-pink-200 hover:bg-pink-50 disabled:opacity-60",
					className,
				)}
				disabled={isUpdating}
				onClick={handleToggle}
				type="button"
			>
				<Icon
					horizontal
					path={isFavorited ? mdiHeart : mdiHeartOutline}
					rotate={180}
					size={1}
					vertical
				/>
			</button>
		</Tooltip>
	);
}
