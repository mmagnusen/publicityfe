import * as React from "react";

import { type Editor, isNodeSelection } from "@tiptap/react";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import { ListIcon } from "@/components/tiptap-icons/list-icon";
// --- Tiptap UI ---
import {
	canToggleList,
	isListActive,
	ListButton,
	type ListType,
	listOptions,
} from "@/components/tiptap-ui/list-button/list-button";
// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { useToolbarDisabled } from "@/components/tiptap-ui-primitive/toolbar";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils";

export interface ListDropdownMenuProps extends Omit<ButtonProps, "type"> {
	/**
	 * The TipTap editor instance.
	 */
	editor?: Editor;
	/**
	 * Whether the dropdown should be hidden when no list types are available
	 * @default false
	 */
	hideWhenUnavailable?: boolean;
	onOpenChange?: (isOpen: boolean) => void;
	/**
	 * The list types to display in the dropdown.
	 */
	types?: ListType[];
}

export const canToggleAnyList = (
	editor: Editor | null,
	listTypes: ListType[],
): boolean => {
	if (!editor) return false;
	return listTypes.some((type) => canToggleList(editor, type));
};

export const isAnyListActive = (
	editor: Editor | null,
	listTypes: ListType[],
): boolean => {
	if (!editor) return false;
	return listTypes.some((type) => isListActive(editor, type));
};

export const getFilteredListOptions = (
	availableTypes: ListType[],
): typeof listOptions => {
	return listOptions.filter(
		(option) => !option.type || availableTypes.includes(option.type),
	);
};

export const shouldShowListDropdown = (params: {
	canToggleAny: boolean;
	editor: Editor | null;
	hideWhenUnavailable: boolean;
	listInSchema: boolean;
	listTypes: ListType[];
}): boolean => {
	const { editor, hideWhenUnavailable, listInSchema, canToggleAny } = params;

	if (!listInSchema || !editor) {
		return false;
	}

	if (hideWhenUnavailable) {
		if (isNodeSelection(editor.state.selection) || !canToggleAny) {
			return false;
		}
	}

	return true;
};

export const useListDropdownState = (
	editor: Editor | null,
	availableTypes: ListType[],
) => {
	const [isOpen, setIsOpen] = React.useState(false);

	const listInSchema = availableTypes.some((type) =>
		isNodeInSchema(type, editor),
	);

	const filteredLists = React.useMemo(
		() => getFilteredListOptions(availableTypes),
		[availableTypes],
	);

	const canToggleAny = canToggleAnyList(editor, availableTypes);
	const isAnyActive = isAnyListActive(editor, availableTypes);

	const handleOpenChange = React.useCallback(
		(open: boolean, callback?: (isOpen: boolean) => void) => {
			setIsOpen(open);
			callback?.(open);
		},
		[],
	);

	return {
		isOpen,
		setIsOpen,
		listInSchema,
		filteredLists,
		canToggleAny,
		isAnyActive,
		handleOpenChange,
	};
};

export const useActiveListIcon = (
	editor: Editor | null,
	filteredLists: typeof listOptions,
) => {
	return React.useCallback(() => {
		const activeOption = filteredLists.find((option) =>
			isListActive(editor, option.type),
		);

		return activeOption ? (
			<activeOption.icon className="tiptap-button-icon" />
		) : (
			<ListIcon className="tiptap-button-icon" />
		);
	}, [editor, filteredLists]);
};

export const ListDropdownMenu = ({
	editor: providedEditor,
	types = ["bulletList", "orderedList", "taskList"],
	hideWhenUnavailable = false,
	onOpenChange,
	...props
}: ListDropdownMenuProps) => {
	const editor = useTiptapEditor(providedEditor);

	const {
		isOpen,
		listInSchema,
		filteredLists,
		canToggleAny,
		isAnyActive,
		handleOpenChange,
	} = useListDropdownState(editor, types);

	const getActiveIcon = useActiveListIcon(editor, filteredLists);

	const show = React.useMemo(() => {
		return shouldShowListDropdown({
			editor,
			listTypes: types,
			hideWhenUnavailable,
			listInSchema,
			canToggleAny,
		});
	}, [editor, types, hideWhenUnavailable, listInSchema, canToggleAny]);

	const handleOnOpenChange = React.useCallback(
		(open: boolean) => handleOpenChange(open, onOpenChange),
		[handleOpenChange, onOpenChange],
	);

	const toolbarDisabled = useToolbarDisabled();
	if (!toolbarDisabled && (!show || !editor || !editor.isEditable)) {
		return null;
	}

	return (
		<DropdownMenu onOpenChange={handleOnOpenChange} open={isOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="List options"
					data-active-state={isAnyActive ? "on" : "off"}
					data-disabled={toolbarDisabled}
					data-style="ghost"
					disabled={toolbarDisabled}
					role="button"
					tabIndex={-1}
					tooltip="List"
					type="button"
					{...props}
				>
					{getActiveIcon()}
					<ChevronDownIcon className="tiptap-button-dropdown-small" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuGroup>
					{filteredLists.map((option) => (
						<DropdownMenuItem asChild key={option.type}>
							<ListButton
								editor={editor}
								hideWhenUnavailable={hideWhenUnavailable}
								text={option.label}
								tooltip={""}
								type={option.type}
							/>
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ListDropdownMenu;
