import { cva } from "class-variance-authority";

export const labelledFieldVariants = cva(
	"mb-4 grid grid-cols-1 gap-4 [&_label]:flex [&_label]:items-center [&_label]:justify-start",
);

export const labelRowVariants = cva("flex gap-4");

export const editIconVariants = cva("cursor-pointer");

export const fieldMessageVariants = cva("mt-2 block text-sm", {
	variants: {
		kind: {
			error: "text-error",
			helper: "text-base-content/70",
		},
	},
	defaultVariants: {
		kind: "helper",
	},
});

export const inputControlVariants = cva(
	"input input-bordered h-10 w-full rounded-sm px-2 text-base outline-none placeholder:text-neutral-500",
	{
		variants: {
			state: {
				valid:
					"border-base-300 bg-base-100 text-base-content hover:border-neutral-400",
				invalid:
					"input-error border-error text-base-content hover:border-error",
				disabled:
					"cursor-not-allowed border-base-300 bg-base-100 text-neutral-500 hover:border-base-300",
			},
			withPrefix: {
				true: "pl-8",
				false: "",
			},
		},
		defaultVariants: {
			state: "valid",
			withPrefix: false,
		},
	},
);

export const textAreaControlVariants = cva(
	"textarea textarea-bordered min-h-[100px] w-full resize-none rounded-sm p-4 text-base outline-none",
	{
		variants: {
			state: {
				valid:
					"border-base-300 bg-base-100 text-base-content hover:border-neutral-400",
				invalid:
					"textarea-error border-error text-base-content hover:border-error",
				disabled:
					"cursor-not-allowed border-base-300 bg-base-100 text-neutral-500 hover:border-base-300",
			},
		},
		defaultVariants: {
			state: "valid",
		},
	},
);

export const inputWrapperVariants = cva(
	"relative flex flex-col [&_*]:box-border",
);

export const inputPrefixVariants = cva(
	"pointer-events-none absolute left-3 top-0 flex h-10 items-center justify-center text-neutral-500 [&_svg]:block [&_svg]:shrink-0 [&_svg]:text-neutral-500",
);

export const showPasswordIconVariants = cva(
	"absolute right-2.5 top-2 cursor-pointer [&_svg]:text-base-content/70",
);
