import axios from "axios";
import { useSWRConfig } from "swr";

import type { User } from "@constants/user";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import { mutateListingDetailAfterSave } from "@util/advertisementSwrKeys";
import { instanceAxios } from "@util/instanceAxios";

export type AdType = "wanted_to_rent" | "offered_to_rent";

export type AdStatus =
	| "archived"
	| "declined"
	| "draft"
	| "submitted"
	| "approved";

import type { ItemToDelete } from "@customTypes/gallery";

type FormValues = {
	content?: string;
	// JSON stringified content for rich text editor
	title?: string;
	rent_pcm_in_pence?: number | null;
	marketing_consent: boolean;
	status?: AdStatus;
	area?: string;
	postcode?: string;
	city?: string;
	latitude?: number | null;
	longitude?: number | null;
};

export type GalleryAsset = {
	is_daily_roundup_thumbnail: boolean;
	asset_type: string;
	asset_url: string;
	pk: number;
};

export type RoomWantedAd = {
	short_description: string | null;
	approval_email_sent_at: string | null;
	content: string;
	created_at: string;
	updated_at: string;
	marketing_consent: boolean;
	pk?: number;
	status: AdStatus;
	title: string;
	user: User;
	wantedtorentgalleryasset_set: GalleryAsset[];
	is_favorited_by_current_user: boolean;
	favorite_count: number;
	chat_message_count: number;
};

export type RoomOfferedAd = {
	short_description: string | null;
	area: string | null;
	approval_email_sent_at: string | null;
	city: string | null;
	content: string;
	created_at: string;
	updated_at: string;
	/** Marketing / Instagram caption when provided by the API. */
	instagram_caption?: string | null;
	latitude: number | null;
	longitude: number | null;
	marketing_consent: boolean;
	offeredtorentgalleryasset_set: GalleryAsset[];
	postcode: string | null;
	status: AdStatus;
	pk?: number;
	title: string;
	user: User;
	is_favorited_by_current_user: boolean;
	favorite_count: number;
	chat_message_count: number;
	rent_pcm_in_pence: number | null;
};

const parseAdPatchResponse = (updated: unknown): { pk?: number } | null => {
	if (!updated || typeof updated !== "object") return null;
	const wrapped = updated as { data?: unknown };
	const fresh = wrapped.data ?? updated;
	return fresh && typeof fresh === "object" ? (fresh as { pk?: number }) : null;
};

const useAdvertisement = () => {
	const { reportError } = useErrorReport({
		functionNamePrefix: "useAdvertisement",
	});
	const { mutate } = useSWRConfig();

	const createAd = async ({
		formValues,
		adType,
	}: {
		adType: AdType;
		formValues: Omit<
			FormValues,
			"content" | "ad_type" | "marketing_consent" | "status"
		> & { content: string; status: AdStatus };
	}) => {
		const endpoint = () => {
			switch (adType) {
				case "wanted_to_rent":
					return `/advertisement/create-wanted`;
				case "offered_to_rent":
					return `/advertisement/create-offered`;
			}
		};

		try {
			const data = await instanceAxios({
				method: "post",
				url: endpoint(),
				data: formValues,
			});

			return data;
		} catch (error) {
			reportError(error, "createAd", REPORT_POSTHOG_ONLY);
			throw error; // Re-throw the error to handle it in the calling component
		}
	};

	const editRoomWantedAd = async ({
		formValues,
		pk,
	}: {
		formValues: Omit<
			FormValues,
			"content" | "ad_type" | "marketing_consent"
		> & {
			content?: string;
			marketing_consent?: boolean;
		};
		pk: number;
	}) => {
		try {
			const { data: updated } = await instanceAxios({
				method: "patch",
				url: `/advertisement/edit-wanted/${pk}`,
				data: formValues,
			});
			await mutateListingDetailAfterSave(
				mutate,
				"wanted",
				pk,
				parseAdPatchResponse(updated),
			);
		} catch (error) {
			reportError(error, "editRoomWantedAd", REPORT_POSTHOG_ONLY);
			throw error; // Re-throw the error to handle it in the calling component
		}
	};

	const editRoomOfferedAd = async ({
		formValues,
		pk,
	}: {
		formValues: Omit<
			FormValues,
			"content" | "ad_type" | "marketing_consent"
		> & {
			content?: string;
			marketing_consent?: boolean;
		};
		pk: number;
	}) => {
		try {
			const { data: updated } = await instanceAxios({
				method: "patch",
				url: `/advertisement/edit-offered/${pk}`,
				data: formValues,
			});
			await mutateListingDetailAfterSave(
				mutate,
				"offered",
				pk,
				parseAdPatchResponse(updated),
			);
		} catch (error) {
			reportError(error, "editRoomOfferedAd", REPORT_POSTHOG_ONLY);
			throw error; // Re-throw the error to handle it in the calling component
		}
	};

	const addRoomWantedGalleryAsset = async ({
		uploadedFilePath,
		roomWantedAdPk,
		fileType,
	}: {
		fileType: string;
		roomWantedAdPk: number;
		uploadedFilePath: string;
	}) => {
		try {
			await instanceAxios({
				method: "post",
				url: `/advertisement/create-wanted-gallery-asset`,
				data: {
					asset_url: uploadedFilePath,
					asset_type: fileType,
					wanted_to_rent_ad: roomWantedAdPk,
				},
			});
			await mutateListingDetailAfterSave(mutate, "wanted", roomWantedAdPk);
		} catch (error) {
			reportError(error, "addRoomWantedGalleryAsset", REPORT_POSTHOG_ONLY);
			throw error; // Re-throw the error to handle it in the calling component
		}
	};

	const addRoomOfferedGalleryAsset = async ({
		uploadedFilePath,
		roomOfferedAdPk,
		fileType,
	}: {
		fileType: string;
		roomOfferedAdPk: number;
		uploadedFilePath: string;
	}) => {
		try {
			await instanceAxios({
				method: "post",
				url: `/advertisement/create-offered-gallery-asset`,
				data: {
					asset_url: uploadedFilePath,
					asset_type: fileType,
					offered_to_rent_ad: roomOfferedAdPk,
				},
			});
			await mutateListingDetailAfterSave(mutate, "offered", roomOfferedAdPk);
		} catch (error) {
			reportError(error, "addRoomOfferedGalleryAsset", REPORT_POSTHOG_ONLY);
			throw error; // Re-throw the error to handle it in the calling component
		}
	};

	const funcDeleteRoomWantedGalleryAsset = async (
		asset: ItemToDelete,
		roomWantedAdPk: number,
	) => {
		try {
			// Request to next.js endpoint to delete from bytescale
			await axios.post("/api/bytescale", {
				filePath: asset.assetUrl,
			});

			// Delete from Delphi database
			await instanceAxios({
				method: "delete",
				url: `/advertisement/delete-wanted-gallery-asset/${asset.pk}`,
			});
			await mutateListingDetailAfterSave(mutate, "wanted", roomWantedAdPk);
		} catch (error) {
			reportError(
				error,
				"funcDeleteRoomWantedGalleryAsset",
				REPORT_POSTHOG_ONLY,
			);
			throw error;
		}
	};

	const funcDeleteRoomOfferedGalleryAsset = async (
		asset: ItemToDelete,
		roomOfferedAdPk: number,
	) => {
		try {
			// Request to next.js endpoint to delete from bytescale
			await axios.post("/api/bytescale", {
				filePath: asset.assetUrl,
			});

			// Delete from Delphi database
			await instanceAxios({
				method: "delete",
				url: `/advertisement/delete-offered-gallery-asset/${asset.pk}`,
			});
			await mutateListingDetailAfterSave(mutate, "offered", roomOfferedAdPk);
		} catch (error) {
			reportError(
				error,
				"funcDeleteRoomOfferedGalleryAsset",
				REPORT_POSTHOG_ONLY,
			);
			throw error;
		}
	};

	const funcApproveAd = async ({
		adType,
		adPk,
	}: {
		adType: AdType;
		adPk: number;
	}) => {
		try {
			await instanceAxios({
				method: "post",
				url: `/advertisement/approve-ad/${adType}/${adPk}`,
			});
		} catch (error) {
			reportError(error, "funcApproveAd", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcDeleteAd = async ({
		adType,
		adPk,
	}: {
		adType: AdType;
		adPk: number;
	}) => {
		try {
			const path =
				adType === "offered_to_rent"
					? `/advertisement/delete-offered/${adPk}`
					: `/advertisement/delete-wanted/${adPk}`;
			await instanceAxios({
				method: "delete",
				url: path,
			});
		} catch (error) {
			reportError(error, "funcDeleteAd", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const archiveMyAd = async ({
		adType,
		adPk,
	}: {
		adType: AdType;
		adPk: number;
	}) => {
		try {
			const url =
				adType === "offered_to_rent"
					? `/advertisement/edit-offered/${adPk}`
					: `/advertisement/edit-wanted/${adPk}`;
			await instanceAxios({
				method: "patch",
				url,
				data: { status: "archived" },
			});
		} catch (error) {
			reportError(error, "archiveMyAd", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const reactivateMyAd = async ({
		adType,
		adPk,
	}: {
		adType: AdType;
		adPk: number;
	}) => {
		try {
			const url =
				adType === "offered_to_rent"
					? `/advertisement/edit-offered/${adPk}`
					: `/advertisement/edit-wanted/${adPk}`;
			await instanceAxios({
				method: "patch",
				url,
				data: { status: "submitted" },
			});
		} catch (error) {
			reportError(error, "reactivateMyAd", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	return {
		createAd,
		editRoomWantedAd,
		editRoomOfferedAd,
		addRoomWantedGalleryAsset,
		addRoomOfferedGalleryAsset,
		funcDeleteRoomWantedGalleryAsset,
		funcDeleteRoomOfferedGalleryAsset,
		funcApproveAd,
		funcDeleteAd,
		archiveMyAd,
		reactivateMyAd,
	};
};

export default useAdvertisement;
