"use client";

import * as React from "react";

import { type Editor, isNodeSelection } from "@tiptap/react";

// --- Icons ---
import { ListIcon } from "@/components/tiptap-icons/list-icon";
import { ListOrderedIcon } from "@/components/tiptap-icons/list-ordered-icon";
import { ListTodoIcon } from "@/components/tiptap-icons/list-todo-icon";
// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils";

export type ListType = "bulletList" | "orderedList" | "taskList";

export interface ListOption {
	icon: React.ElementType;
	label: string;
	type: ListType;
}

export interface ListButtonProps extends Omit<ButtonProps, "type"> {
	/**
	 * The TipTap editor instance.
	 */
	editor?: Editor | null;
	/**
	 * Whether the button should hide when the list is not available.
	 * @default false
	 */
	hideWhenUnavailable?: boolean;
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string;
	/**
	 * The type of list to toggle.
	 */
	type: ListType;
}

export const listOptions: ListOption[] = [
	{
		label: "Bullet List",
		type: "bulletList",
		icon: ListIcon,
	},
	{
		label: "Ordered List",
		type: "orderedList",
		icon: ListOrderedIcon,
	},
	{
		label: "Task List",
		type: "taskList",
		icon: ListTodoIcon,
	},
];

export const listShortcutKeys: Record<ListType, string> = {
	bulletList: "Ctrl-Shift-8",
	orderedList: "Ctrl-Shift-7",
	taskList: "Ctrl-Shift-9",
};

export const canToggleList = (
	editor: Editor | null,
	type: ListType,
): boolean => {
	if (!editor) {
		return false;
	}

	switch (type) {
		case "bulletList":
			return editor.can().toggleBulletList();
		case "orderedList":
			return editor.can().toggleOrderedList();
		case "taskList":
			return editor.can().toggleList("taskList", "taskItem");
		default:
			return false;
	}
};

export const isListActive = (
	editor: Editor | null,
	type: ListType,
): boolean => {
	if (!editor) return false;

	switch (type) {
		case "bulletList":
			return editor.isActive("bulletList");
		case "orderedList":
			return editor.isActive("orderedList");
		case "taskList":
			return editor.isActive("taskList");
		default:
			return false;
	}
};

export const toggleList = (editor: Editor | null, type: ListType): void => {
	if (!editor) return;

	switch (type) {
		case "bulletList":
			editor.chain().focus().toggleBulletList().run();
			break;
		case "orderedList":
			editor.chain().focus().toggleOrderedList().run();
			break;
		case "taskList":
			editor.chain().focus().toggleList("taskList", "taskItem").run();
			break;
	}
};

export const getListOption = (type: ListType): ListOption | undefined => {
	return listOptions.find((option) => option.type === type);
};

export const shouldShowListButton = (params: {
	editor: Editor | null;
	hideWhenUnavailable: boolean;
	listInSchema: boolean;
	type: ListType;
}): boolean => {
	const { editor, type, hideWhenUnavailable, listInSchema } = params;

	if (!listInSchema || !editor) {
		return false;
	}

	if (hideWhenUnavailable) {
		if (
			isNodeSelection(editor.state.selection) ||
			!canToggleList(editor, type)
		) {
			return false;
		}
	}

	return true;
};

export const useListState = (editor: Editor | null, type: ListType) => {
	const listInSchema = isNodeInSchema(type, editor);
	const listOption = getListOption(type);
	const isActive = isListActive(editor, type);
	const shortcutKey = listShortcutKeys[type];

	return {
		listInSchema,
		listOption,
		isActive,
		shortcutKey,
	};
};

export const ListButton = React.forwardRef<HTMLButtonElement, ListButtonProps>(
	(
		{
			editor: providedEditor,
			type,
			hideWhenUnavailable = false,
			className = "",
			onClick,
			text,
			children,
			...buttonProps
		},
		ref,
	) => {
		const editor = useTiptapEditor(providedEditor);
		const { listInSchema, listOption, isActive, shortcutKey } = useListState(
			editor,
			type,
		);

		const Icon = listOption?.icon || ListIcon;

		const handleClick = React.useCallback(
			(e: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(e);

				if (!e.defaultPrevented && editor) {
					toggleList(editor, type);
				}
			},
			[onClick, editor, type],
		);

		const show = React.useMemo(() => {
			return shouldShowListButton({
				editor,
				type,
				hideWhenUnavailable,
				listInSchema,
			});
		}, [editor, type, hideWhenUnavailable, listInSchema]);

		if (!show || !editor || !editor.isEditable) {
			return null;
		}

		return (
			<Button
				aria-label={listOption?.label || type}
				aria-pressed={isActive}
				className={className.trim()}
				data-active-state={isActive ? "on" : "off"}
				data-style="ghost"
				onClick={handleClick}
				role="button"
				shortcutKeys={shortcutKey}
				tabIndex={-1}
				tooltip={listOption?.label || type}
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

ListButton.displayName = "ListButton";

export default ListButton;
