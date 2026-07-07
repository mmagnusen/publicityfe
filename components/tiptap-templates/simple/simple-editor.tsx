// --- Icons ---

import * as React from "react";

import { ArrowLeftIcon } from "@components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@components/tiptap-icons/link-icon";
// --- Components ---
// import { ThemeToggle } from "@components/tiptap-templates/simple/theme-toggle";
// import { BlockQuoteButton } from "@components/tiptap-ui/blockquote-button";
// import { CodeBlockButton } from "@components/tiptap-ui/code-block-button";
import {
	ColorHighlightPopover,
	ColorHighlightPopoverButton,
	ColorHighlightPopoverContent,
} from "@components/tiptap-ui/color-highlight-popover";
// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@components/tiptap-ui/image-upload-button";
// import { ImageUploadButtonEmoji } from "@components/tiptap-ui/image-upload-button-emoji";
import {
	LinkButton,
	LinkContent,
	LinkPopover,
} from "@components/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@components/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@components/tiptap-ui/mark-button";
// import { TextAlignButton } from "@components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@components/tiptap-ui/undo-redo-button";
// --- UI Primitives ---
import { Button } from "@components/tiptap-ui-primitive/button";
import { Spacer } from "@components/tiptap-ui-primitive/spacer";
import {
	Toolbar,
	ToolbarGroup,
	ToolbarSeparator,
} from "@components/tiptap-ui-primitive/toolbar";
import type { Validation } from "@customTypes/index";
import { useCursorVisibility } from "@hooks/use-cursor-visibility";
import { useWindowSize } from "@hooks/use-window-size";
// --- Hooks ---
import useMedia from "@hooks/useMedia";
import { type Editor, EditorContent, EditorContext } from "@tiptap/react";

import { cn } from "@/lib/cn";

const MainToolbarContent = ({
	allowImages,
	onHighlighterClick,
	onLinkClick,
	isMobile,
}: {
	allowImages?: boolean;
	isMobile: boolean;
	onHighlighterClick: () => void;
	onLinkClick: () => void;
}) => {
	return (
		<>
			{/* <Spacer /> */}
			<ToolbarGroup>
				<UndoRedoButton action="undo" />
				<UndoRedoButton action="redo" />
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarGroup>
				<HeadingDropdownMenu levels={[1, 2, 3, 4]} />
				<ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
				{/* <BlockQuoteButton /> */}
				{/* <CodeBlockButton /> */}
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarGroup>
				<MarkButton type="bold" />
				<MarkButton type="italic" />
				{/* <MarkButton type="strike" /> */}
				{/* <MarkButton type="code" /> */}
				<MarkButton type="underline" />
				{!isMobile ? (
					<ColorHighlightPopover />
				) : (
					<ColorHighlightPopoverButton onClick={onHighlighterClick} />
				)}
				{!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
			</ToolbarGroup>
			<ToolbarSeparator />
			{/* <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator /> */}
			{/* <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      */}
			{/* <ToolbarSeparator /> */}
			{allowImages ? (
				<ToolbarGroup>
					<ImageUploadButton text="Add" />
					{/* <ImageUploadButtonEmoji text="Emoji" /> */}
				</ToolbarGroup>
			) : null}
			<Spacer />
			{isMobile && <ToolbarSeparator />}
			{/* <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup> */}
		</>
	);
};

const MobileToolbarContent = ({
	type,
	onBack,
}: {
	onBack: () => void;
	type: "highlighter" | "link";
}) => (
	<>
		<ToolbarGroup>
			<Button data-style="ghost" onClick={onBack}>
				<ArrowLeftIcon className="tiptap-button-icon" />
				{type === "highlighter" ? (
					<HighlighterIcon className="tiptap-button-icon" />
				) : (
					<LinkIcon className="tiptap-button-icon" />
				)}
			</Button>
		</ToolbarGroup>

		<ToolbarSeparator />

		{type === "highlighter" ? (
			<ColorHighlightPopoverContent />
		) : (
			<LinkContent />
		)}
	</>
);

export type SimpleEditorProps = {
	allowImages?: boolean;
	children?: React.ReactNode;
	contentMinHeight?: string;
	editor: Editor | null;
	objValidation?: Validation;
	renderToolbar?: boolean;
	bIsEnabled?: boolean;
};

const SimpleEditor = ({
	allowImages = false,
	editor,
	children,
	contentMinHeight,
	renderToolbar,
	bIsEnabled = true,
}: SimpleEditorProps) => {
	const isMobile = useMedia("(max-width: 768px)");
	const windowSize = useWindowSize();
	const [mobileView, setMobileView] = React.useState<
		"main" | "highlighter" | "link"
	>("main");
	const toolbarRef = React.useRef<HTMLDivElement>(null);

	const bodyRect = useCursorVisibility({
		editor: renderToolbar ? editor : null,
		overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
	});

	React.useEffect(() => {
		if (!isMobile && mobileView !== "main") {
			setMobileView("main");
		}
	}, [isMobile, mobileView]);

	return (
		<EditorContext.Provider value={{ editor }}>
			{renderToolbar ? (
				<Toolbar
					bIsEnabled={bIsEnabled}
					ref={toolbarRef}
					style={
						isMobile
							? {
									bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
								}
							: {}
					}
				>
					{mobileView === "main" ? (
						<MainToolbarContent
							allowImages={allowImages}
							isMobile={isMobile}
							onHighlighterClick={() => setMobileView("highlighter")}
							onLinkClick={() => setMobileView("link")}
						/>
					) : (
						<MobileToolbarContent
							onBack={() => setMobileView("main")}
							type={mobileView === "highlighter" ? "highlighter" : "link"}
						/>
					)}
				</Toolbar>
			) : (
				false
			)}

			<div
				className={cn("content-wrapper", {
					"content-wrapper--no-toolbar": !renderToolbar,
				})}
				style={contentMinHeight ? { minHeight: contentMinHeight } : undefined}
			>
				<EditorContent
					className="simple-editor-content"
					editor={editor}
					role="presentation"
				/>
			</div>
			{children}
		</EditorContext.Provider>
	);
};

export default SimpleEditor;
