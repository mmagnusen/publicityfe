import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { type TextVariant, textVariants } from "./style";

export type TextProps = {
	variant?: TextVariant;
	className?: string;
	children: React.ReactNode;
} & HTMLAttributes<HTMLParagraphElement>;

const Text = ({
	variant = "body",
	className,
	children,
	...rest
}: TextProps) => {
	return (
		<p className={cn(textVariants({ variant }), className)} {...rest}>
			{children}
		</p>
	);
};

export default Text;
