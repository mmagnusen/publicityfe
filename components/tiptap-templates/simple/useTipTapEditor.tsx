// --- Lib ---

import { useEffect, useRef } from "react";

// --- Custom Extensions ---
import { Link } from "@components/tiptap-extension/link-extension";
import { Selection } from "@components/tiptap-extension/selection-extension";
import { TrailingNode } from "@components/tiptap-extension/trailing-node-extension";
// --- Tiptap Node ---
import { ImageUploadNode } from "@components/tiptap-node/image-upload-node/image-upload-node-extension";
import type { RichTextContent } from "@customTypes/index";
import { handleImageUpload, MAX_FILE_SIZE } from "@lib/tiptap-utils";
import CharacterCount from "@tiptap/extension-character-count";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Mention } from "@tiptap/extension-mention";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import { type JSONContent, useEditor } from "@tiptap/react";
// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";

import createSuggestion from "./mentions/suggestion";

const chatMentionsReleased =
	String(process.env.NEXT_PUBLIC_CHAT_MENTIONS_RELEASED) === "true";

type Props = {
	characterLimit?: number;
	editable?: boolean;
	existingContent?: JSONContent | null | string;
	/** When set (e.g. private chat channel pk), passed as channel_id when fetching mentions. */
	mentionChannelId?: number | null;
	onBlur?: ({
		characterCount,
		wordCount,
	}: {
		characterCount: number;
		wordCount: number;
	}) => void;
	onChange?: ({
		characterCount,
		wordCount,
		editorJSON,
		editorHTML,
	}: RichTextContent) => void;
	placeholder?: string;
};

const useTipTapEditor = ({
	editable = true,
	existingContent,
	characterLimit,
	mentionChannelId,
	onBlur,
	onChange,
	placeholder = "Start typing... ",
}: Props) => {
	const editor = useEditor({
		immediatelyRender: false,
		editable,
		editorProps: {
			attributes: {
				autocomplete: "off",
				autocorrect: "off",
				autocapitalize: "off",
				"aria-label": "Main content area, start typing to enter text.",
			},
		},
		extensions: [
			StarterKit,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			Underline,
			TaskList,
			TaskItem.configure({ nested: true }),
			Highlight.configure({ multicolor: true }),
			Image,
			Typography,
			Superscript,
			Subscript,
			...(chatMentionsReleased
				? [
						Mention.configure({
							HTMLAttributes: {
								class: "my-custom-class",
							},
							suggestion: createSuggestion(mentionChannelId ?? undefined),
						}),
					]
				: []),
			Selection,
			CharacterCount.configure({
				limit: characterLimit,
			}),
			ImageUploadNode.configure({
				accept: "image/*",
				maxSize: MAX_FILE_SIZE,
				limit: 3,
				upload: handleImageUpload,
				onError: (error) => console.error("Upload failed:", error),
			}),
			TrailingNode,
			Link.configure({ openOnClick: false }),
			Placeholder.configure({ placeholder }),
		],
		onBlur: ({ editor }) => {
			const { characters, words } = editor.extensionStorage.characterCount;
			const characterCount = characters?.() || 0;
			const wordCount = words?.() || 0;
			return onBlur?.({ characterCount, wordCount });
		},
		onUpdate: ({ editor }) => {
			if (
				existingContent != null &&
				existingContent !== "" &&
				!lastSyncedContentRef.current &&
				editor.isEmpty
			) {
				return;
			}

			const { characters, words } = editor.extensionStorage.characterCount;

			const characterCount = characters?.() || 0;
			const wordCount = words?.() || 0;
			return onChange?.({
				characterCount,
				wordCount,
				editorJSON: editor.getJSON(),
				editorHTML: editor.getHTML(),
			});
		},
		content: existingContent,
	});

	// useEditor only applies `content` on mount. Read-only views (e.g. listing detail
	// after SWR refetch) pass new existingContent without remounting — sync here instead.
	const lastSyncedContentRef = useRef<string | null>(null);

	useEffect(() => {
		if (!editor) return;

		if (existingContent == null || existingContent === "") {
			if (lastSyncedContentRef.current !== "") {
				editor.commands.clearContent(true);
				lastSyncedContentRef.current = "";
			}
			return;
		}

		const nextContent =
			typeof existingContent === "string"
				? (JSON.parse(existingContent) as JSONContent)
				: existingContent;
		const serialized = JSON.stringify(nextContent);
		if (serialized === lastSyncedContentRef.current) return;

		editor.commands.setContent(nextContent, false);
		lastSyncedContentRef.current = serialized;
	}, [editor, existingContent]);

	const clearEditor = () => {
		editor?.commands.clearContent(true);
	};

	return {
		clearEditor,
		editor,
	};
};

export default useTipTapEditor;
