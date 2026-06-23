"use client";

import {
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useState,
} from "react";

import {
	autoUpdate,
	FloatingPortal,
	flip,
	offset,
	type Placement,
	shift,
	useDismiss,
	useFloating,
	useFocus,
	useHover,
	useInteractions,
	useMergeRefs,
	useRole,
} from "@floating-ui/react";

import { cn } from "@/lib/cn";
import { tooltipContentVariants } from "./style";

interface Props {
	children: ReactElement | ReactElement[] | string;
	placement?: Placement;
	tooltipContent: string | ReactNode;
}

const Tooltip = ({ children, placement = "top", tooltipContent }: Props) => {
	const [open, setOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open,
		onOpenChange: setOpen,
		placement,
		whileElementsMounted: autoUpdate,
		middleware: [offset(6), flip(), shift({ padding: 8 })],
	});

	const hover = useHover(context, {
		delay: { open: 200, close: 0 },
		move: false,
	});
	const focus = useFocus(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "tooltip" });
	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
		dismiss,
		role,
	]);

	if (!isValidElement(children)) {
		return (
			<span {...getReferenceProps({ ref: refs.setReference })}>{children}</span>
		);
	}

	const childRef = (children.props as { ref?: React.Ref<unknown> }).ref;
	const ref = useMergeRefs([refs.setReference, childRef]);

	return (
		<>
			{cloneElement(
				children,
				getReferenceProps({
					ref,
					...(typeof children.props === "object" ? children.props : {}),
				}),
			)}
			{open ? (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps({
							className: cn(
								"z-9999 max-w-xs rounded-md bg-gray-900 text-xs font-medium text-white shadow-md",
							),
						})}
					>
						<div className={tooltipContentVariants()}>{tooltipContent}</div>
					</div>
				</FloatingPortal>
			) : null}
		</>
	);
};

export default Tooltip;
