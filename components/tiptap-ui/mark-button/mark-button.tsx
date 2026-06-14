import * as React from "react";

import { type Editor, isNodeSelection } from "@tiptap/react";

// --- Icons ---
import { BoldIcon } from "@/components/tiptap-icons/bold-icon";
import { Code2Icon } from "@/components/tiptap-icons/code2-icon";
import { ItalicIcon } from "@/components/tiptap-icons/italic-icon";
import { StrikeIcon } from "@/components/tiptap-icons/strike-icon";
import { SubscriptIcon } from "@/components/tiptap-icons/subscript-icon";
import { SuperscriptIcon } from "@/components/tiptap-icons/superscript-icon";
import { UnderlineIcon } from "@/components/tiptap-icons/underline-icon";
// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { useToolbarDisabled } from "@/components/tiptap-ui-primitive/toolbar";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils";

export type Mark =
	| "bold"
	| "italic"
	| "strike"
	| "code"
	| "underline"
	| "superscript"
	| "subscript";

export interface MarkButtonProps extends Omit<ButtonProps, "type"> {
	/**
	 * Optional editor instance. If not provided, will use editor from context
	 */
	editor?: Editor | null;
	/**
	 * Whether this button should be hidden when the mark is not available
	 */
	hideWhenUnavailable?: boolean;
	/**
	 * Display text for the button (optional)
	 */
	text?: string;
	/**
	 * The type of mark to toggle
	 */
	type: Mark;
}

export const markIcons = {
	bold: BoldIcon,
	italic: ItalicIcon,
	underline: UnderlineIcon,
	strike: StrikeIcon,
	code: Code2Icon,
	superscript: SuperscriptIcon,
	subscript: SubscriptIcon,
};

export const markShortcutKeys: Partial<Record<Mark, string>> = {
	bold: "Ctrl-b",
	italic: "Ctrl-i",
	underline: "Ctrl-u",
	strike: "Ctrl-Shift-s",
	code: "Ctrl-e",
	superscript: "Ctrl-.",
	subscript: "Ctrl-,",
};

export const canToggleMark = (editor: Editor | null, type: Mark): boolean => {
	if (!editor) return false;

	try {
		return editor.can().toggleMark(type);
	} catch {
		return false;
	}
};

export const isMarkActive = (editor: Editor | null, type: Mark): boolean => {
	if (!editor) return false;
	return editor.isActive(type);
};

export const toggleMark = (editor: Editor | null, type: Mark): void => {
	if (!editor) return;
	editor.chain().focus().toggleMark(type).run();
};

export const isMarkButtonDisabled = (
	editor: Editor | null,
	type: Mark,
	userDisabled: boolean = false,
): boolean => {
	if (!editor) return true;
	if (userDisabled) return true;
	if (editor.isActive("codeBlock")) return true;
	if (!canToggleMark(editor, type)) return true;
	return false;
};

export const shouldShowMarkButton = (params: {
	editor: Editor | null;
	hideWhenUnavailable: boolean;
	markInSchema: boolean;
	type: Mark;
}): boolean => {
	const { editor, type, hideWhenUnavailable, markInSchema } = params;

	if (!markInSchema || !editor) {
		return false;
	}

	if (hideWhenUnavailable) {
		if (
			isNodeSelection(editor.state.selection) ||
			!canToggleMark(editor, type)
		) {
			return false;
		}
	}

	return true;
};

export const getFormattedMarkName = (type: Mark): string => {
	return type.charAt(0).toUpperCase() + type.slice(1);
};

export const useMarkState = (
	editor: Editor | null,
	type: Mark,
	disabled: boolean = false,
) => {
	const markInSchema = isMarkInSchema(type, editor);
	const isDisabled = isMarkButtonDisabled(editor, type, disabled);
	const isActive = isMarkActive(editor, type);

	const Icon = markIcons[type];
	const shortcutKey = markShortcutKeys[type];
	const formattedName = getFormattedMarkName(type);

	return {
		markInSchema,
		isDisabled,
		isActive,
		Icon,
		shortcutKey,
		formattedName,
	};
};

export const MarkButton = React.forwardRef<HTMLButtonElement, MarkButtonProps>(
	(
		{
			editor: providedEditor,
			type,
			text,
			hideWhenUnavailable = false,
			className = "",
			disabled,
			onClick,
			children,
			...buttonProps
		},
		ref,
	) => {
		const editor = useTiptapEditor(providedEditor);

		const toolbarDisabled = useToolbarDisabled();
		const {
			markInSchema,
			isDisabled,
			isActive,
			Icon,
			shortcutKey,
			formattedName,
		} = useMarkState(editor, type, disabled);

		const handleClick = React.useCallback(
			(e: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(e);

				if (!e.defaultPrevented && !isDisabled && editor) {
					toggleMark(editor, type);
				}
			},
			[onClick, isDisabled, editor, type],
		);

		const show = React.useMemo(() => {
			return shouldShowMarkButton({
				editor,
				type,
				hideWhenUnavailable,
				markInSchema,
			});
		}, [editor, type, hideWhenUnavailable, markInSchema]);

		if (!toolbarDisabled && (!show || !editor || !editor.isEditable)) {
			return null;
		}

		return (
			<Button
				aria-label={type}
				aria-pressed={isActive}
				className={className.trim()}
				data-active-state={isActive ? "on" : "off"}
				data-disabled={isDisabled || toolbarDisabled}
				data-style="ghost"
				disabled={isDisabled || toolbarDisabled}
				onClick={handleClick}
				role="button"
				shortcutKeys={shortcutKey}
				tabIndex={-1}
				tooltip={formattedName}
				type="button"
				{...buttonProps}
				ref={ref}
			>
				{children || (
					<>
						<Icon className="tiptap-button-icon" />
						{text && <span className="tiptap-button-text">{text}</span>}
					</>
				)}
			</Button>
		);
	},
);

MarkButton.displayName = "MarkButton";

export default MarkButton;
