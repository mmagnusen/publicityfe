import { createElement, type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import {
	defaultHeadingVariantByLevel,
	type HeadingVariant,
	headingVariants,
} from "./style";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = {
	level: HeadingLevel;
	variant?: HeadingVariant;
	className?: string;
	children: React.ReactNode;
} & HTMLAttributes<HTMLHeadingElement>;

const Heading = ({
	level,
	variant,
	className,
	children,
	...rest
}: HeadingProps) => {
	const resolvedVariant = variant ?? defaultHeadingVariantByLevel[level];

	return createElement(
		`h${level}`,
		{
			className: cn(headingVariants({ variant: resolvedVariant }), className),
			...rest,
		},
		children,
	);
};

export default Heading;
