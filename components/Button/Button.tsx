import type { MouseEvent } from "react";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";

import { cn } from "@/lib/cn";
import {
	buttonVariants,
	buttonWrapperVariants,
	hiddenChildrenVariants,
	loadingSpanVariants,
	loadingSpinnerVariants,
} from "./style";

export type ButtonProps = {
	bBoxShadow?: boolean;
	bLoading?: boolean;
	borderRadius?: "none" | "small" | "medium" | "large" | "pill";
	children: React.ReactElement | string;
	className?: string;
	href?: string;
	isDisabled?: boolean;
	isFullWidth?: boolean;
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
	size?: "none" | "small" | "medium" | "large";
	strVariant?:
		| "primary"
		| "green"
		| "red"
		| "link"
		| "white"
		| "transparent"
		| "transparentWithBorder"
		| "outlineInverse";
	textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
	type?: "button" | "submit" | "reset";
	isButtonTagFlex?: boolean;
};

const Button = ({
	bLoading,
	children,
	href,
	isDisabled,
	onClick,
	strVariant = "primary",
	textTransform = "none",
	type = "submit",
	bBoxShadow,
	borderRadius = "medium",
	isButtonTagFlex = true,
	size = "medium",
	isFullWidth = false,
	className,
	...restProps
}: ButtonProps) => {
	const isInactive = Boolean(isDisabled || bLoading);
	const controlClassName = cn(
		buttonVariants({
			...(isInactive
				? { isDisabled: true }
				: { strVariant, isDisabled: false }),
			borderRadius,
			size,
			textTransform,
			isFullWidth,
			bBoxShadow,
			bLoading,
		}),
		className,
	);
	const content = bLoading ? (
		<span className={loadingSpanVariants()}>
			<span className={hiddenChildrenVariants()}>{children}</span>
			<CircularProgress className={loadingSpinnerVariants()} color="inherit" />
		</span>
	) : (
		<span>{children}</span>
	);

	return (
		<div className={buttonWrapperVariants({ isFullWidth, isButtonTagFlex })}>
			{href && !isInactive ? (
				<Link href={href} className={controlClassName}>
					{content}
				</Link>
			) : href && isInactive ? (
				<span aria-disabled="true" className={controlClassName}>
					{content}
				</span>
			) : (
				<button
					className={controlClassName}
					{...restProps}
					disabled={isInactive}
					onClick={onClick}
					type={type}
				>
					{content}
				</button>
			)}
		</div>
	);
};

export default Button;
