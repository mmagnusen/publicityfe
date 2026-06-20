"use client";

import useTipTapEditor from "@components/tiptap-templates/simple/useTipTapEditor";
import { EditorContent, type JSONContent } from "@tiptap/react";

import { cn } from "@/lib/cn";

type RichTextRendererProps = {
	richText: JSONContent | null;
	className?: string;
};

const RichTextRenderer = ({ richText, className }: RichTextRendererProps) => {
	const { editor } = useTipTapEditor({
		editable: false,
		existingContent: richText,
	});

	if (!richText) {
		return null;
	}

	return (
		<div
			className={cn(
				"text-base leading-relaxed text-gray-600",
				"[&_a]:text-violet-600 [&_h2]:mb-4 [&_img]:max-w-full [&_li]:leading-8 [&_p]:wrap-break-word [&_p]:leading-8",
				className,
			)}
		>
			<EditorContent editor={editor} />
		</div>
	);
};

export default RichTextRenderer;
