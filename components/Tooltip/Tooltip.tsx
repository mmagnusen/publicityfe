import type { ReactElement, ReactNode } from "react";

import Tippy, { type TippyProps } from "@tippyjs/react";

import { tooltipContentVariants } from "./style";

interface Props extends Omit<TippyProps, "children"> {
	children: ReactElement | ReactElement[] | string;
	placement?: TippyProps["placement"];
	tooltipContent: string | ReactNode;
}

const Tooltip = ({
	children,
	placement,
	tooltipContent,
	...restProps
}: Props) => {
	return (
		<Tippy
			arrow
			content={<div className={tooltipContentVariants()}>{tooltipContent}</div>}
			placement={placement}
			{...restProps}
		>
			{/** span is needed as children must be an element */}
			<span>{children}</span>
		</Tippy>
	);
};

export default Tooltip;
