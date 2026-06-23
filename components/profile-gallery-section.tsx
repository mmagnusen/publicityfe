"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { mdiDelete, mdiImageOutline } from "@mdi/js";
import Icon from "@mdi/react";

import UploadButton, {
	resolveBytescaleDisplayUrl,
} from "@components/UploadButton";
import type { ItemToDelete } from "@customTypes/gallery";
import type { GalleryAsset } from "@hooks/useAdvertisement";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

import Heading from "@/components/Heading";

const GALLERY_UPLOAD_PATH = "profile-lifestyle";

type GalleryResponse = {
	results: GalleryAsset[];
};

type ProfileGallerySectionProps = {
	displayName: string;
	initialGallery: GalleryAsset[];
	profileUsername: string;
	userPk: number;
};

export function ProfileGallerySection({
	displayName,
	initialGallery,
	profileUsername,
	userPk,
}: ProfileGallerySectionProps) {
	const {
		authenticatedUser,
		canUseAuthenticatedApi,
		funcAddGalleryImage,
		funcDeleteGalleryImage,
	} = useAuthenticatedUser();
	const [isUploading, setIsUploading] = useState(false);
	const [deletingPk, setDeletingPk] = useState<number | null>(null);

	const isOwner =
		Boolean(authenticatedUser?.username?.trim()) &&
		authenticatedUser?.username?.trim() === profileUsername.trim();

	const galleryKey =
		isOwner && canUseAuthenticatedApi && userPk
			? `/users/fetch-gallery-assets/${userPk}`
			: null;

	const { data, mutate } = useSWR<GalleryResponse>(galleryKey, fetcher, {
		revalidateOnMount: true,
	});

	const assets =
		isOwner && canUseAuthenticatedApi
			? (data?.results ?? initialGallery)
			: initialGallery;

	const handleUploadComplete = async ({
		uploadedFilePath,
	}: {
		uploadedFilePath: string;
	}) => {
		setIsUploading(true);
		try {
			await funcAddGalleryImage({ uploadedFilePath });
			await mutate();
			toast.success("Gallery image added");
		} catch {
			toast.error("Unable to add gallery image");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDelete = async (asset: GalleryAsset) => {
		const confirmed = window.confirm(
			"Delete this image? This cannot be undone.",
		);
		if (!confirmed) {
			return;
		}

		const item: ItemToDelete = {
			pk: asset.pk,
			assetUrl: asset.asset_url,
		};

		setDeletingPk(asset.pk);
		try {
			await funcDeleteGalleryImage(item);
			await mutate();
			toast.success("Gallery image removed");
		} catch {
			toast.error("Unable to delete gallery image");
		} finally {
			setDeletingPk(null);
		}
	};

	return (
		<section className="mt-10">
			<div className="flex items-center justify-between gap-4">
				<Heading level={2} variant="label">
					Gallery
				</Heading>
				{isOwner && canUseAuthenticatedApi ? (
					<UploadButton
						bUseIcon
						iconPath={mdiImageOutline}
						isLoading={isUploading}
						onComplete={handleUploadComplete}
						path={GALLERY_UPLOAD_PATH}
						options={{ mimeTypes: ["image/*"] }}
					/>
				) : null}
			</div>

			{assets.length === 0 ? (
				<p className="mt-4 text-sm text-gray-500">No gallery images yet.</p>
			) : (
				<div className="mt-4 grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[140px] sm:grid-cols-3">
					{assets.map((asset, index) => {
						const imageUrl = resolveBytescaleDisplayUrl(asset.asset_url);
						if (!imageUrl) {
							return null;
						}

						return (
							<div
								key={asset.pk}
								className="relative h-full overflow-hidden rounded-2xl bg-gray-100"
							>
								{/* Gallery images come from Bytescale CDN URLs — not in next/image config. */}
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={imageUrl}
									alt={`${displayName} gallery ${index + 1}`}
									className="size-full object-cover"
								/>
								{isOwner && canUseAuthenticatedApi ? (
									<button
										type="button"
										aria-label={`Delete gallery image ${index + 1}`}
										className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-red-600 shadow-sm transition hover:bg-white disabled:opacity-50"
										disabled={deletingPk === asset.pk}
										onClick={() => handleDelete(asset)}
									>
										<Icon path={mdiDelete} size={0.7} />
									</button>
								) : null}
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
