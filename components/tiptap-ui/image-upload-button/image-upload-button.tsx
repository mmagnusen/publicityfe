import * as React from "react";
import { toast } from "react-toastify";

import { UploadButton as ByteScaleUploadButton } from "@bytescale/upload-widget-react";
import { buildURL } from "@components/UploadButton";
import type { Editor } from "@tiptap/react";
import { v4 as uuidv4 } from "uuid";

// --- Icons ---
import { ImagePlusIcon } from "@/components/tiptap-icons/image-plus-icon";
// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { useToolbarDisabled } from "@/components/tiptap-ui-primitive/toolbar";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

export interface ImageUploadButtonProps extends ButtonProps {
	editor?: Editor | null;
	extensionName?: string;
	text?: string;
}

export const isImageActive = (
	editor: Editor | null,
	extensionName: string,
): boolean => {
	if (!editor) return false;
	return editor.isActive(extensionName);
};

export const insertImage = (
	editor: Editor | null,
	extensionName: string,
): boolean => {
	if (!editor) return false;

	return editor
		.chain()
		.focus()
		.insertContent({
			type: extensionName,
		})
		.run();
};

export const useImageUploadButton = (
	editor: Editor | null,
	extensionName: string = "imageUpload",
	disabled: boolean = false,
) => {
	const isActive = isImageActive(editor, extensionName);
	const handleInsertImage = React.useCallback(() => {
		if (disabled) return false;
		return insertImage(editor, extensionName);
	}, [editor, extensionName, disabled]);

	return {
		isActive,
		handleInsertImage,
	};
};

const frontendPublicAPIKey = process.env
	.NEXT_PUBLIC_BYTESCALE_PUBLIC_FRONTEND_KEY as string;

export const ImageUploadButton = React.forwardRef<
	HTMLButtonElement,
	ImageUploadButtonProps
>(
	(
		{
			editor: providedEditor,
			extensionName = "imageUpload",
			text,
			className = "",
			disabled,
			onClick,
			children,
			...buttonProps
		},
		ref,
	) => {
		const editor = useTiptapEditor(providedEditor);
		const { isActive } = useImageUploadButton(editor, extensionName, disabled);

		// const handleClick = React.useCallback(
		// 	(e: React.MouseEvent<HTMLButtonElement>) => {
		// 		onClick?.(e);

		// 		if (!e.defaultPrevented && !disabled) {
		// 			handleInsertImage is imported from useImageUploadButton
		// 			handleInsertImage();
		// 		}
		// 	},
		// 	[onClick, disabled, handleInsertImage],
		// );

		const toolbarDisabled = useToolbarDisabled();
		if (!toolbarDisabled && (!editor || !editor.isEditable)) {
			return null;
		}

		const defaultOptions = {
			apiKey: frontendPublicAPIKey,
			maxFileCount: 1,
			path: {
				fileName: uuidv4(),
				folderPath: "chat-text-editor",
			},
		};

		const handleComplete = (files: any) => {
			if (files && files.length > 0) {
				const file = files[0];

				if (file.error) {
					toast.error(`Error uploading file: ${file.error}`);
					return;
				}

				const assetUrl = buildURL({
					path: file.filePath,
				});

				editor?.chain().focus().setImage({ src: assetUrl }).run();
			}
		};
		return (
			<ByteScaleUploadButton
				onComplete={handleComplete}
				options={defaultOptions}
			>
				{({ onClick }) => (
					<Button
						aria-label="Add image"
						aria-pressed={isActive}
						className={className.trim()}
						data-active-state={isActive ? "on" : "off"}
						data-disabled={toolbarDisabled}
						data-style="ghost"
						disabled={toolbarDisabled}
						onClick={onClick}
						ref={ref}
						role="button"
						tabIndex={-1}
						tooltip="Add image"
						type="button"
						{...buttonProps}
					>
						{children || (
							<>
								<ImagePlusIcon className="tiptap-button-icon" />
								{text && <span className="tiptap-button-text">{text}</span>}
							</>
						)}
					</Button>
				)}
			</ByteScaleUploadButton>
		);
	},
);

ImageUploadButton.displayName = "ImageUploadButton";

export default ImageUploadButton;
