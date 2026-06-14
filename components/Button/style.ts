import { cva } from "class-variance-authority";

export const buttonWrapperVariants = cva("flex cursor-pointer items-center", {
	variants: {
		isFullWidth: {
			true: "w-full",
			false: "",
		},
		isButtonTagFlex: {
			true: "[&_button]:inline-flex [&_a]:inline-flex",
			false: "",
		},
	},
	defaultVariants: {
		isFullWidth: false,
		isButtonTagFlex: true,
	},
});

export const buttonVariants = cva(
	"inline-flex items-center justify-center border border-transparent font-medium outline-none transition-colors [&>span]:inline-flex [&>span]:items-center [&>span]:justify-center",
	{
		variants: {
			strVariant: {
				primary:
					"bg-black font-semibold text-white hover:bg-gray-800 [&>span]:text-white",
				green: "bg-green-700 text-white hover:bg-green-800 [&>span]:text-white",
				red: "bg-red-600 text-white hover:bg-red-700 [&>span]:text-white",
				link: "h-auto min-h-0 border-transparent bg-transparent px-0 text-black shadow-none hover:underline",
				white: "bg-white text-black hover:bg-gray-100 [&>span]:text-black",
				transparent:
					"border-transparent bg-transparent text-black hover:bg-gray-50",
				transparentWithBorder:
					"border-gray-300 bg-white font-semibold text-gray-600 hover:bg-gray-50 [&>span]:text-gray-600",
				outlineInverse:
					"border-white/80 bg-transparent text-white hover:bg-white/10 [&>span]:text-white",
			},
			borderRadius: {
				none: "rounded-none",
				small: "rounded-sm",
				medium: "rounded-lg",
				large: "rounded-xl",
				pill: "rounded-full",
			},
			size: {
				none: "h-auto min-h-0 px-2",
				small: "px-3 py-1.5 text-xs",
				medium: "px-4 py-2 text-sm",
				large: "px-8 py-3.5 text-base",
			},
			textTransform: {
				none: "normal-case",
				capitalize: "capitalize",
				uppercase: "uppercase",
				lowercase: "lowercase",
			},
			isFullWidth: {
				true: "w-full py-3 font-semibold",
				false: "",
			},
			bBoxShadow: {
				true: "shadow-[rgba(0,0,0,0.1)_0px_1px_2px_0.5px,rgba(0,0,0,0.05)_0px_1px_4px_0px,rgba(0,0,0,0.16)_0px_0px_1px_0px]",
				false: "",
			},
			isDisabled: {
				true: "pointer-events-none cursor-not-allowed opacity-60",
				false: "cursor-pointer",
			},
			bLoading: {
				true: "",
				false: "",
			},
		},
		defaultVariants: {
			strVariant: "primary",
			borderRadius: "medium",
			size: "medium",
			textTransform: "none",
			isFullWidth: false,
			bBoxShadow: false,
			isDisabled: false,
			bLoading: false,
		},
	},
);

export const loadingSpanVariants = cva("relative");

export const loadingSpinnerVariants = cva(
	"!absolute left-[calc(50%-10px)] top-[calc(50%-12px)] !h-[25px] !w-[25px]",
);

export const hiddenChildrenVariants = cva("invisible");
