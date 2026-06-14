import * as React from "react";

type Orientation = "horizontal" | "vertical";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
	decorative?: boolean;
	orientation?: Orientation;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
	(
		{ decorative, orientation = "vertical", className = "", ...divProps },
		ref,
	) => {
		const ariaOrientation =
			orientation === "vertical" ? orientation : undefined;
		const semanticProps = decorative
			? { role: "none" }
			: { "aria-orientation": ariaOrientation, role: "separator" };

		return (
			<div
				className={`tiptap-separator ${className}`.trim()}
				data-orientation={orientation}
				{...semanticProps}
				{...divProps}
				ref={ref}
			/>
		);
	},
);

Separator.displayName = "Separator";
