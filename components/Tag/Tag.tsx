import type { PropsWithChildren } from "react";

import { cn } from "@/lib/cn";
import { type TagSkin, tagVariants } from "./style";

export type { TagSkin };

type TagProps = PropsWithChildren<{
	skin: TagSkin;
}>;

const Tag = ({ children, skin }: TagProps) => {
	return (
		<div className={cn(tagVariants({ skin }))} data-testid="tag">
			{children}
		</div>
	);
};

export default Tag;
