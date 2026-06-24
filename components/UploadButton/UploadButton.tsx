import { toast } from "react-toastify";
import { mdiCogOutline } from "@mdi/js";
import Icon from "@mdi/react";

import * as Bytescale from "@bytescale/sdk";
import { UploadButton as ByteScaleUploadButton } from "@bytescale/upload-widget-react";
import Button from "@components/Button";
import { normalizeBytescaleFilePath } from "@util/bytescaleFilePath";

const accountID = String(process.env.NEXT_PUBLIC_BYTESCALE_ACCOUNT_ID);

export const buildURL = ({
	path,
	transformation = "image",
}: {
	path: null | string;
	transformation?: "image" | "video" | null;
}) => {
	if (!path) {
		return "";
	}

	return Bytescale.UrlBuilder.url({
		accountId: accountID,
		filePath: path,
		...(transformation !== null && { options: { transformation } }),
	});
};

/** CDN URL for display- accepts a full URL or a Bytescale storage path. */
export const resolveBytescaleDisplayUrl = (
	urlOrPath?: string | null,
): string | null => {
	if (!urlOrPath?.trim()) {
		return null;
	}

	const trimmed = urlOrPath.trim();
	if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
		return trimmed;
	}

	return buildURL({ path: trimmed }) || null;
};

export const filePathFromBytescalePublicUrl = (
	urlOrPath: string,
): string | null => {
	const trimmed = urlOrPath?.trim() ?? "";
	if (!trimmed) {
		return null;
	}

	if (!trimmed.startsWith("http")) {
		if (trimmed.includes("..")) {
			return null;
		}
		if (!/^[\w./-]+$/.test(trimmed)) {
			return null;
		}
		return normalizeBytescaleFilePath(trimmed);
	}

	try {
		const u = new URL(trimmed);
		if (!u.hostname.endsWith("upcdn.io")) {
			return null;
		}

		const markers = [`/${accountID}/raw/`, `/${accountID}/image/`] as const;
		for (const marker of markers) {
			const idx = u.pathname.indexOf(marker);
			if (idx !== -1) {
				const tail = u.pathname.slice(idx + marker.length);
				if (!tail) {
					return null;
				}
				return normalizeBytescaleFilePath(
					decodeURIComponent(tail.replace(/\//g, "%2F")),
				);
			}
		}

		const presetMatch = u.pathname.match(
			new RegExp(`^/${accountID}/([^/]+)/(.+)$`),
		);
		if (presetMatch && presetMatch[1] !== "raw" && presetMatch[1] !== "image") {
			const tail = presetMatch[2];
			return normalizeBytescaleFilePath(
				decodeURIComponent(tail.replace(/\//g, "%2F")),
			);
		}
	} catch {
		return null;
	}

	return null;
};

type Props = {
	bUseIcon?: boolean;
	iconPath?: string;
	isLoading?: boolean;
	onComplete: ({
		uploadedFilePath,
		fileType,
	}: {
		fileType: string;
		uploadedFilePath: string;
	}) => void;
	options?: Record<string, unknown>;
	path: string;
	uploadButtonText?: string;
};

const frontendPublicAPIKey =
	process.env.NEXT_PUBLIC_BYTESCALE_PUBLIC_FRONTEND_KEY;

const UploadButton = ({
	bUseIcon,
	iconPath = mdiCogOutline,
	isLoading,
	options,
	path,
	onComplete,
	uploadButtonText,
}: Props) => {
	const defaultOptions = {
		...options,
		apiKey: frontendPublicAPIKey ?? "",
		maxFileCount: 1,
		path: {
			fileName: "{UNIQUE_DIGITS_12}",
			folderPath: path,
		},
	};

	const handlePhotoUploadComplete = (
		files: Array<{
			error?: string;
			filePath: string;
			originalFile: { mime: string };
		}>,
	) => {
		if (files && files.length > 0) {
			const file = files[0];

			if (file.error) {
				toast.error(`Error uploading file: ${file.error}`);
				return;
			}
			onComplete?.({
				uploadedFilePath: file.filePath,
				fileType: file.originalFile.mime,
			});
		}
	};

	return (
		<ByteScaleUploadButton
			onComplete={handlePhotoUploadComplete}
			options={defaultOptions}
		>
			{({ onClick }) => (
				<>
					{bUseIcon ? (
						<div
							className="flex w-min cursor-pointer rounded-full bg-white"
							onClick={onClick}
							onKeyDown={() => void 0}
							role="button"
							tabIndex={0}
						>
							<Icon path={iconPath} size={1} />
						</div>
					) : (
						<div className="mb-6 w-[200px]">
							<Button
								bLoading={isLoading}
								onClick={onClick}
								strVariant="primary"
								type="button"
								isFullWidth
							>
								{uploadButtonText || "Upload new image"}
							</Button>
						</div>
					)}
				</>
			)}
		</ByteScaleUploadButton>
	);
};

export default UploadButton;
