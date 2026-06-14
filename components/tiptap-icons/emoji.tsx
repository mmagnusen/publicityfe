import * as React from "react";

export const EmojiIcon = React.memo(
	({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		return (
			<svg
				className={className}
				fill="none"
				height="24"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				viewBox="0 0 24 24"
				width="24"
				xmlns="http://www.w3.org/2000/svg"
				{...props}
			>
				<path d="M22 11v1a10 10 0 1 1-9-10" />
				<path d="M8 14s1.5 2 4 2 4-2 4-2" />
				<line x1="9" x2="9.01" y1="9" y2="9" />
				<line x1="15" x2="15.01" y1="9" y2="9" />
				<path d="M16 5h6" />
				<path d="M19 2v6" />
			</svg>
		);
	},
);

EmojiIcon.displayName = "ImagePlusIcon";
