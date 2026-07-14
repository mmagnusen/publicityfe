import type { RichTextContent } from "@customTypes/index";
import type { Attrs, Node } from "@tiptap/pm/model";
import type { Editor, JSONContent } from "@tiptap/react";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Checks if a mark exists in the editor schema
 * @param markName - The name of the mark to check
 * @param editor - The editor instance
 * @returns boolean indicating if the mark exists in the schema
 */
export const isMarkInSchema = (
	markName: string,
	editor: Editor | null,
): boolean => {
	if (!editor?.schema) return false;
	return editor.schema.spec.marks.get(markName) !== undefined;
};

/**
 * Checks if a node exists in the editor schema
 * @param nodeName - The name of the node to check
 * @param editor - The editor instance
 * @returns boolean indicating if the node exists in the schema
 */
export const isNodeInSchema = (
	nodeName: string,
	editor: Editor | null,
): boolean => {
	if (!editor?.schema) return false;
	return editor.schema.spec.nodes.get(nodeName) !== undefined;
};

/**
 * Gets the active attributes of a specific mark in the current editor selection.
 *
 * @param editor - The Tiptap editor instance.
 * @param markName - The name of the mark to look for (e.g., "highlight", "link").
 * @returns The attributes of the active mark, or `null` if the mark is not active.
 */
export const getActiveMarkAttrs = (
	editor: Editor | null,
	markName: string,
): Attrs | null => {
	if (!editor) return null;
	const { state } = editor;
	const marks = state.storedMarks || state.selection.$from.marks();
	const mark = marks.find((mark) => mark.type.name === markName);

	return mark?.attrs ?? null;
};

/**
 * Checks if a node is empty
 */
export const isEmptyNode = (node?: Node | null): boolean => {
	return !!node && node.content.size === 0;
};

/**
 * Utility function to conditionally join class names into a single string.
 * Filters out falsey values like false, undefined, null, and empty strings.
 *
 * @param classes - List of class name strings or falsey values.
 * @returns A single space-separated string of valid class names.
 */
export const cn = (
	...classes: (string | boolean | undefined | null)[]
): string => {
	return classes.filter(Boolean).join(" ");
};

/**
 * Finds the position and instance of a node in the document
 * @param props Object containing editor, node (optional), and nodePos (optional)
 * @param props.editor The TipTap editor instance
 * @param props.node The node to find (optional if nodePos is provided)
 * @param props.nodePos The position of the node to find (optional if node is provided)
 * @returns An object with the position and node, or null if not found
 */
export const findNodePosition = (props: {
	editor: Editor | null;
	node?: Node | null;
	nodePos?: number | null;
}): { node: Node; pos: number } | null => {
	const { editor, node, nodePos } = props;

	if (!editor || !editor.state?.doc) return null;

	// Zero is valid position
	const hasValidNode = node !== undefined && node !== null;
	const hasValidPos = nodePos !== undefined && nodePos !== null;

	if (!hasValidNode && !hasValidPos) {
		return null;
	}

	if (hasValidPos) {
		try {
			const nodeAtPos = editor.state.doc.nodeAt(nodePos!);
			if (nodeAtPos) {
				return { pos: nodePos!, node: nodeAtPos };
			}
		} catch (error) {
			console.error("Error checking node at position:", error);
			return null;
		}
	}

	// Otherwise search for the node in the document
	let foundPos = -1;
	let foundNode: Node | null = null;

	editor.state.doc.descendants((currentNode, pos) => {
		// TODO: Needed?
		// if (currentNode.type && currentNode.type.name === node!.type.name) {
		if (currentNode === node) {
			foundPos = pos;
			foundNode = currentNode;
			return false;
		}
		return true;
	});

	return foundPos !== -1 && foundNode !== null
		? { pos: foundPos, node: foundNode }
		: null;
};

/**
 * Handles image upload with progress tracking and abort capability
 * @param file The file to upload
 * @param onProgress Optional callback for tracking upload progress
 * @param abortSignal Optional AbortSignal for cancelling the upload
 * @returns Promise resolving to the URL of the uploaded image
 */
export const handleImageUpload = async (
	file: File,
	onProgress?: (event: { progress: number }) => void,
	abortSignal?: AbortSignal,
): Promise<string> => {
	// Validate file
	if (!file) {
		throw new Error("No file provided");
	}

	if (file.size > MAX_FILE_SIZE) {
		throw new Error(
			`File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
		);
	}

	// For demo/testing: Simulate upload progress
	for (let progress = 0; progress <= 100; progress += 10) {
		if (abortSignal?.aborted) {
			throw new Error("Upload cancelled");
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
		onProgress?.({ progress });
	}

	return "/images/placeholder-image.png";

	// Uncomment for production use:
	// return convertFileToBase64(file, abortSignal);
};

/**
 * Converts a File to base64 string
 * @param file The file to convert
 * @param abortSignal Optional AbortSignal for cancelling the conversion
 * @returns Promise resolving to the base64 representation of the file
 */
export const convertFileToBase64 = (
	file: File,
	abortSignal?: AbortSignal,
): Promise<string> => {
	if (!file) {
		return Promise.reject(new Error("No file provided"));
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		const abortHandler = () => {
			reader.abort();
			reject(new Error("Upload cancelled"));
		};

		if (abortSignal) {
			abortSignal.addEventListener("abort", abortHandler);
		}

		reader.onloadend = () => {
			if (abortSignal) {
				abortSignal.removeEventListener("abort", abortHandler);
			}

			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("Failed to convert File to base64"));
			}
		};

		reader.onerror = (error) =>
			reject(new Error(`File reading error: ${error}`));
		reader.readAsDataURL(file);
	});
};

export const emptyTipTapDoc = (): JSONContent => ({ type: "doc", content: [] });

export const isTipTapDoc = (value: unknown): value is JSONContent =>
	typeof value === "object" &&
	value !== null &&
	(value as JSONContent).type === "doc";

/** Parse API / Formik values into a TipTap doc (handles JSON strings and double-encoding). */
export const parseTipTapDocFromApi = (raw: unknown): JSONContent | null => {
	if (raw == null || raw === "") {
		return null;
	}

	let value: unknown = raw;
	if (typeof value === "object" && value !== null && "editorJSON" in value) {
		value = (value as RichTextContent).editorJSON;
	}

	for (let depth = 0; depth < 3; depth += 1) {
		if (isTipTapDoc(value)) {
			return value;
		}
		if (typeof value !== "string") {
			break;
		}
		const trimmed = value.trim();
		if (!trimmed) {
			break;
		}
		try {
			value = JSON.parse(trimmed) as unknown;
		} catch {
			break;
		}
	}

	return isTipTapDoc(value) ? value : null;
};

const BLOCK_NODE_TYPES = new Set([
	"blockquote",
	"bulletList",
	"heading",
	"listItem",
	"orderedList",
	"paragraph",
]);

const extractPlainTextFromNode = (node: JSONContent): string => {
	if (node.type === "hardBreak") {
		return "\n";
	}

	if (node.type === "text" && typeof node.text === "string") {
		return node.text;
	}

	if (!Array.isArray(node.content)) {
		return "";
	}

	const parts = node.content.map(extractPlainTextFromNode).filter(Boolean);
	const joinWithNewline =
		node.type === "doc" ||
		(parts.length > 1 &&
			node.content.some(
				(child) => child.type != null && BLOCK_NODE_TYPES.has(child.type),
			));

	return parts.join(joinWithNewline ? "\n" : "");
};

/** Plain text for display when API stores a TipTap JSON string or doc. */
export const tipTapApiValueToPlainText = (raw: string | undefined): string => {
	if (!raw?.trim()) {
		return "";
	}

	const doc = parseTipTapDocFromApi(raw);
	if (doc) {
		const plain = extractPlainTextFromNode(doc).trim();
		return plain || raw.trim();
	}

	return raw.trim();
};

/** Recover hubs saved when the API received a stringified doc (stored as plain text in one paragraph). */
export const unwrapMisstoredJsonStringTipTapDoc = (
	doc: JSONContent,
): JSONContent => {
	const blocks = doc.content;
	if (!Array.isArray(blocks) || blocks.length !== 1) {
		return doc;
	}
	const block = blocks[0];
	if (block?.type !== "paragraph" || !Array.isArray(block.content)) {
		return doc;
	}
	if (block.content.length !== 1) {
		return doc;
	}
	const inline = block.content[0];
	if (inline?.type !== "text" || typeof inline.text !== "string") {
		return doc;
	}
	const text = inline.text.trim();
	if (!text.startsWith("{")) {
		return doc;
	}
	return parseTipTapDocFromApi(text) ?? doc;
};

/** Parse a profile/API rich-text field into TipTap JSON for read-only rendering. */
export const richTextDocFromApiField = (
	raw: string | undefined | null,
): JSONContent | null => {
	const trimmed = raw?.trim();
	if (!trimmed) {
		return null;
	}

	const parsedDoc = parseTipTapDocFromApi(trimmed);
	if (parsedDoc) {
		return unwrapMisstoredJsonStringTipTapDoc(parsedDoc);
	}

	return {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [{ type: "text", text: trimmed }],
			},
		],
	};
};
