import { useCallback } from "react";
import { useSWRConfig } from "swr";

import type {
	ApiOpportunity,
	OpportunitiesPaginatedResponse,
} from "@customTypes/opportunity";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import {
	getOpportunityPkFromItem,
	OPPORTUNITIES_LIST_PATH,
	OPPORTUNITY_FETCH_MY_FAVORITES_PATH,
	OPPORTUNITY_SET_FAVORITE_PATH,
	opportunityDetailPath,
} from "@hooks/useOpportunities";
import { instanceAxios } from "@util/instanceAxios";

const applyFavoriteToOpportunityList = (
	data: OpportunitiesPaginatedResponse | undefined,
	opportunityId: number,
	isFavorited: boolean,
): OpportunitiesPaginatedResponse | undefined => {
	if (!data?.results) {
		return data;
	}

	return {
		...data,
		results: data.results.map((item) => {
			const pk = getOpportunityPkFromItem(item);
			if (pk !== opportunityId) {
				return item;
			}

			if (
				item != null &&
				typeof item === "object" &&
				"opportunity" in item &&
				item.opportunity
			) {
				return {
					...item,
					opportunity: { ...item.opportunity, is_favorited: isFavorited },
				};
			}

			return { ...item, is_favorited: isFavorited };
		}),
	};
};

const isOpportunityListSwrKey = (key: unknown): boolean =>
	typeof key === "string" && key.startsWith(OPPORTUNITIES_LIST_PATH);

const isFavouriteOpportunityListSwrKey = (key: unknown): boolean =>
	typeof key === "string" &&
	key.startsWith(OPPORTUNITY_FETCH_MY_FAVORITES_PATH);

export const useOpportunityFavourites = () => {
	const { reportError } = useErrorReport({
		functionNamePrefix: "useOpportunityFavourites",
	});
	const { mutate } = useSWRConfig();

	const setOpportunityFavorite = useCallback(
		async (opportunityId: number, isFavorited: boolean) => {
			const detailKey = opportunityDetailPath(opportunityId);

			try {
				await mutate(
					isOpportunityListSwrKey,
					(data: OpportunitiesPaginatedResponse | undefined) =>
						applyFavoriteToOpportunityList(data, opportunityId, isFavorited),
					{ revalidate: false, populateCache: true },
				);

				await mutate(
					detailKey,
					(data: ApiOpportunity | undefined) => {
						if (!data) {
							return data;
						}

						return { ...data, is_favorited: isFavorited };
					},
					{ revalidate: false, populateCache: true },
				);

				if (!isFavorited) {
					await mutate(
						isFavouriteOpportunityListSwrKey,
						(data: OpportunitiesPaginatedResponse | undefined) => {
							if (!data?.results) {
								return data;
							}

							return {
								...data,
								count: Math.max(data.count - 1, 0),
								results: data.results.filter(
									(item) => getOpportunityPkFromItem(item) !== opportunityId,
								),
							};
						},
						{ revalidate: false, populateCache: true },
					);
				}

				await instanceAxios.post(OPPORTUNITY_SET_FAVORITE_PATH, {
					opportunity_id: opportunityId,
					is_favorited: isFavorited,
				});

				if (isFavorited) {
					mutate(isFavouriteOpportunityListSwrKey);
				}
			} catch (error: unknown) {
				mutate(isOpportunityListSwrKey);
				mutate(detailKey);
				mutate(isFavouriteOpportunityListSwrKey);
				reportError(error, "setOpportunityFavorite", REPORT_POSTHOG_ONLY);
				throw error;
			}
		},
		[mutate, reportError],
	);

	return { setOpportunityFavorite };
};
