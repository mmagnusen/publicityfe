import type { Key, ScopedMutator } from "swr";

import type { AdType } from "@hooks/useAdvertisement";

export type RentalListingKind = "offered" | "wanted";

/** Dedupe window for single-ad SWR fetches on listing detail pages (matches ISR revalidate). */
export const LISTING_DETAIL_SWR_DEDUPING_MS = 60_000;

export const singleOfferedAdSwrKey = (pk: number): string =>
	`/advertisement/fetch-single-ad-offered/${pk}`;

export const singleWantedAdSwrKey = (pk: number): string =>
	`/advertisement/fetch-single-ad-wanted/${pk}`;

export const singleAdSwrKey = (pk: number, adType: AdType): string =>
	adType === "offered_to_rent"
		? singleOfferedAdSwrKey(pk)
		: singleWantedAdSwrKey(pk);

const isOfferedListingsSwrKey = (key: Key): boolean => {
	if (Array.isArray(key)) {
		const prefix = key[0];
		return (
			prefix === "/advertisement/fetch-ad-offered" ||
			prefix === "listings-search" ||
			prefix === "location-hub-offered"
		);
	}
	return false;
};

const isWantedListingsSwrKey = (key: Key): boolean => {
	if (Array.isArray(key)) {
		return key[0] === "/advertisement/fetch-ad-wanted";
	}
	return false;
};

/** Invalidates global SWR for the detail key (and listing indexes) after a save. */
export const mutateListingDetailAfterSave = (
	mutate: ScopedMutator,
	kind: RentalListingKind,
	pk: number,
	fresh?: { pk?: number } | null,
): Promise<unknown[]> => {
	const detailKey =
		kind === "offered" ? singleOfferedAdSwrKey(pk) : singleWantedAdSwrKey(pk);
	const hasFullDetail =
		fresh?.pk != null &&
		typeof (fresh as { title?: unknown }).title === "string";
	const detailMutate = hasFullDetail
		? mutate(detailKey, fresh, { revalidate: false })
		: mutate(detailKey);
	const listMutate =
		kind === "offered"
			? mutate(isOfferedListingsSwrKey)
			: mutate(isWantedListingsSwrKey);
	return Promise.all([detailMutate, listMutate]);
};
