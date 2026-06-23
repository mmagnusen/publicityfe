"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { mdiImageOutline } from "@mdi/js";

import UploadButton, {
	buildURL,
	resolveBytescaleDisplayUrl,
} from "@components/UploadButton";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

const PROFILE_UPLOAD_PATH = "profile";

function ProfileAvatar({
	name,
	imageUrl,
}: {
	name: string;
	imageUrl?: string | null;
}) {
	const initial = name.charAt(0).toUpperCase() || "?";

	if (imageUrl?.trim()) {
		return (
			// Profile images come from Bytescale CDN URLs — not in next/image config.
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={imageUrl.trim()}
				alt={name}
				className="size-full object-cover"
			/>
		);
	}

	return (
		<div
			className="flex size-full items-center justify-center bg-gray-200 text-5xl font-semibold text-gray-500"
			aria-hidden
		>
			{initial}
		</div>
	);
}

type ProfileAvatarSectionProps = {
	name: string;
	initialAvatarUrl?: string | null;
	profileUsername: string;
};

export function ProfileAvatarSection({
	name,
	initialAvatarUrl,
	profileUsername,
}: ProfileAvatarSectionProps) {
	const {
		authenticatedUser,
		canUseAuthenticatedApi,
		funcUpdateProfilePicture,
		profilePicURL,
	} = useAuthenticatedUser();
	const [isUploading, setIsUploading] = useState(false);
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

	const isOwner =
		Boolean(authenticatedUser?.username?.trim()) &&
		authenticatedUser?.username?.trim() === profileUsername.trim();

	const displayUrl = useMemo(() => {
		if (uploadedUrl) {
			return uploadedUrl;
		}
		if (isOwner && profilePicURL) {
			return resolveBytescaleDisplayUrl(profilePicURL);
		}
		return resolveBytescaleDisplayUrl(initialAvatarUrl);
	}, [uploadedUrl, isOwner, profilePicURL, initialAvatarUrl]);

	const handleUploadComplete = async ({
		uploadedFilePath,
	}: {
		uploadedFilePath: string;
		fileType: string;
	}) => {
		setIsUploading(true);
		try {
			await funcUpdateProfilePicture(uploadedFilePath);
			setUploadedUrl(buildURL({ path: uploadedFilePath }));
			toast.success("Profile picture updated");
		} catch {
			toast.error("Unable to update profile picture");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
			<ProfileAvatar name={name} imageUrl={displayUrl} />
			{isOwner && canUseAuthenticatedApi ? (
				<div className="absolute top-3 right-3 z-10 rounded-full bg-white p-1 shadow-md">
					<UploadButton
						bUseIcon
						iconPath={mdiImageOutline}
						isLoading={isUploading}
						onComplete={handleUploadComplete}
						path={PROFILE_UPLOAD_PATH}
						options={{ mimeTypes: ["image/*"] }}
					/>
				</div>
			) : null}
		</div>
	);
}
