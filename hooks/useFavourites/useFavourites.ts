import { useSWRConfig } from "swr";

import type { AdType } from "@hooks/useAdvertisement";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import usePosthog from "@hooks/usePosthog";
import { instanceAxios } from "@util/instanceAxios";

/** SWR cache key prefixes for paginated listing responses (all share `results`). */
const OFFERED_LISTINGS_SWR_KEY_PREFIXES = new Set([
	"/advertisement/fetch-ad-offered",
	"location-hub-offered",
	"listings-search",
]);

const WANTED_LISTINGS_SWR_KEY_PREFIXES = new Set([
	"/advertisement/fetch-ad-wanted",
]);

type PaginatedAdList = {
	results: Array<{
		pk?: number;
		is_favorited_by_current_user?: boolean;
		favorite_count?: number;
	}>;
};

type MyFavoritesList = {
	count: number;
	results: Array<{ ad: { pk: number } }>;
};

const isPaginatedAdListSwrKey = (key: unknown, ad_type: AdType): boolean => {
	if (!Array.isArray(key) || typeof key[0] !== "string") {
		return false;
	}
	const prefixes =
		ad_type === "wanted_to_rent"
			? WANTED_LISTINGS_SWR_KEY_PREFIXES
			: OFFERED_LISTINGS_SWR_KEY_PREFIXES;
	return prefixes.has(key[0]);
};

const applyFavoriteToPaginatedList = (
	data: PaginatedAdList | undefined,
	advertisementId: number,
	isFavorited: boolean,
): PaginatedAdList | undefined => {
	if (!data?.results) {
		return data;
	}
	return {
		...data,
		results: data.results.map((ad) =>
			ad.pk === advertisementId
				? {
						...ad,
						is_favorited_by_current_user: isFavorited,
						favorite_count: isFavorited
							? (ad.favorite_count || 0) + 1
							: Math.max((ad.favorite_count || 1) - 1, 0),
					}
				: ad,
		),
	};
};

export const useFavourites = () => {
	const { capturePosthogEvent } = usePosthog();
	const { reportError } = useErrorReport({
		functionNamePrefix: "useFavourites",
	});
	const { mutate } = useSWRConfig();

	const funcAddToFavourites = async ({
		advertisementId,
		ad_type,
	}: {
		advertisementId: number;
		ad_type: AdType;
	}) => {
		const singleAdEndpoint =
			ad_type === "wanted_to_rent"
				? `/advertisement/fetch-single-ad-wanted/${advertisementId}`
				: `/advertisement/fetch-single-ad-offered/${advertisementId}`;

		try {
			await mutate(
				(key) => isPaginatedAdListSwrKey(key, ad_type),
				async (data: PaginatedAdList | undefined) =>
					applyFavoriteToPaginatedList(data, advertisementId, true),
				{ revalidate: false, populateCache: true },
			);

			await mutate(
				singleAdEndpoint,
				async (data: PaginatedAdList["results"][number] | undefined) => {
					if (!data) {
						return data;
					}
					return {
						...data,
						is_favorited_by_current_user: true,
						favorite_count: (data.favorite_count || 0) + 1,
					};
				},
				{ revalidate: false, populateCache: true },
			);

			await instanceAxios({
				method: "post",
				url: `/advertisement/create-favorite`,
				data: {
					ad_id: advertisementId,
					ad_type: ad_type,
				},
			});

			capturePosthogEvent("ad_added_to_favourites", {
				ad_id: advertisementId,
				ad_type,
			});

			mutate("/advertisement/fetch-my-favorites");
		} catch (error: unknown) {
			mutate((key) => isPaginatedAdListSwrKey(key, ad_type));
			mutate(singleAdEndpoint);
			reportError(error, "funcAddToFavourites", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcRemoveFromFavourites = async ({
		advertisementId,
		ad_type,
	}: {
		advertisementId: number;
		ad_type: AdType;
	}) => {
		const singleAdEndpoint =
			ad_type === "wanted_to_rent"
				? `/advertisement/fetch-single-ad-wanted/${advertisementId}`
				: `/advertisement/fetch-single-ad-offered/${advertisementId}`;

		try {
			await mutate(
				(key) => isPaginatedAdListSwrKey(key, ad_type),
				async (data: PaginatedAdList | undefined) =>
					applyFavoriteToPaginatedList(data, advertisementId, false),
				{ revalidate: false, populateCache: true },
			);

			await mutate(
				singleAdEndpoint,
				async (data: PaginatedAdList["results"][number] | undefined) => {
					if (!data) {
						return data;
					}
					return {
						...data,
						is_favorited_by_current_user: false,
						favorite_count: Math.max((data.favorite_count || 1) - 1, 0),
					};
				},
				{ revalidate: false, populateCache: true },
			);

			await mutate<MyFavoritesList>(
				"/advertisement/fetch-my-favorites",
				(data) => {
					if (!data?.results) {
						return data;
					}
					return {
						...data,
						count: Math.max(data.count - 1, 0),
						results: data.results.filter(
							(favorite) => favorite.ad.pk !== advertisementId,
						),
					};
				},
				{ revalidate: false, populateCache: true },
			);

			await instanceAxios({
				method: "delete",
				url: `/advertisement/remove-favorite`,
				params: {
					ad_type: ad_type,
					ad_id: advertisementId,
				},
			});
		} catch (error: unknown) {
			mutate((key) => isPaginatedAdListSwrKey(key, ad_type));
			mutate(singleAdEndpoint);
			mutate("/advertisement/fetch-my-favorites");
			reportError(error, "funcRemoveFromFavourites", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	return {
		funcAddToFavourites,
		funcRemoveFromFavourites,
	};
};
