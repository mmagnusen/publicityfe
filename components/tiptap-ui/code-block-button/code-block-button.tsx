import * as React from "react";

import { type Editor, isNodeSelection } from "@tiptap/react";

// --- Icons ---
import { CodeBlockIcon } from "@/components/tiptap-icons/code-block-icon";
// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils";

export interface CodeBlockButtonProps extends Omit<ButtonProps, "type"> {
	/**
	 * The TipTap editor instance.
	 */
	editor?: Editor | null;
	/**
	 * Whether the button should hide when the node is not available.
	 * @default false
	 */
	hideWhenUnavailable?: boolean;
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string;
}

export const canToggleCodeBlock = (editor: Editor | null): boolean => {
	if (!editor) return false;

	try {
		return editor.can().toggleNode("codeBlock", "paragraph");
	} catch {
		return false;
	}
};

export const isCodeBlockActive = (editor: Editor | null): boolean => {
	if (!editor) return false;
	return editor.isActive("codeBlock");
};

export const toggleCodeBlock = (editor: Editor | null): boolean => {
	if (!editor) return false;
	return editor.chain().focus().toggleNode("codeBlock", "paragraph").run();
};

export const isCodeBlockButtonDisabled = (
	editor: Editor | null,
	canToggle: boolean,
	userDisabled: boolean = false,
): boolean => {
	if (!editor) return true;
	if (userDisabled) return true;
	if (!canToggle) return true;
	return false;
};

export const shouldShowCodeBlockButton = (params: {
	canToggle: boolean;
	editor: Editor | null;
	hideWhenUnavailable: boolean;
	nodeInSchema: boolean;
}): boolean => {
	const { editor, hideWhenUnavailable, nodeInSchema, canToggle } = params;

	if (!nodeInSchema || !editor) {
		return false;
	}

	if (hideWhenUnavailable) {
		if (isNodeSelection(editor.state.selection) || !canToggle) {
			return false;
		}
	}

	return Boolean(editor?.isEditable);
};

export const useCodeBlockState = (
	editor: Editor | null,
	disabled: boolean = false,
	hideWhenUnavailable: boolean = false,
) => {
	const nodeInSchema = isNodeInSchema("codeBlock", editor);

	const canToggle = canToggleCodeBlock(editor);
	const isDisabled = isCodeBlockButtonDisabled(editor, canToggle, disabled);
	const isActive = isCodeBlockActive(editor);

	const shouldShow = React.useMemo(
		() =>
			shouldShowCodeBlockButton({
				editor,
				hideWhenUnavailable,
				nodeInSchema,
				canToggle,
			}),
		[editor, hideWhenUnavailable, nodeInSchema, canToggle],
	);

	const handleToggle = React.useCallback(() => {
		if (!isDisabled && editor) {
			return toggleCodeBlock(editor);
		}
		return false;
	}, [editor, isDisabled]);

	const shortcutKey = "Ctrl-Alt-c";
	const label = "Code Block";

	return {
		nodeInSchema,
		canToggle,
		isDisabled,
		isActive,
		shouldShow,
		handleToggle,
		shortcutKey,
		label,
	};
};

export const CodeBlockButton = React.forwardRef<
	HTMLButtonElement,
	CodeBlockButtonProps
>(
	(
		{
			editor: providedEditor,
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

		const {
			isDisabled,
			isActive,
			shouldShow,
			handleToggle,
			shortcutKey,
			label,
		} = useCodeBlockState(editor, disabled, hideWhenUnavailable);

		const handleClick = React.useCallback(
			(e: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(e);

				if (!e.defaultPrevented && !isDisabled) {
					handleToggle();
				}
			},
			[onClick, isDisabled, handleToggle],
		);

		if (!shouldShow || !editor || !editor.isEditable) {
			return null;
		}

		return (
			<Button
				aria-label="codeBlock"
				aria-pressed={isActive}
				className={className.trim()}
				data-active-state={isActive ? "on" : "off"}
				data-disabled={isDisabled}
				data-style="ghost"
				disabled={isDisabled}
				onClick={handleClick}
				role="button"
				shortcutKeys={shortcutKey}
				tabIndex={-1}
				tooltip={label}
				type="button"
				{...buttonProps}
				ref={ref}
			>
				{children || (
					<>
						<CodeBlockIcon className="tiptap-button-icon" />
						{text && <span className="tiptap-button-text">{text}</span>}
					</>
				)}
			</Button>
		);
	},
);

CodeBlockButton.displayName = "CodeBlockButton";

export default CodeBlockButton;
