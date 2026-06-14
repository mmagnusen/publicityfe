"use client";

import * as React from "react";

import type { Editor } from "@tiptap/core";
import { useCurrentEditor } from "@tiptap/react";

export const useTiptapEditor = (
	providedEditor?: Editor | null,
): Editor | null => {
	const { editor: coreEditor } = useCurrentEditor();
	return React.useMemo(
		() => providedEditor || coreEditor,
		[providedEditor, coreEditor],
	);
};
