import { cva, type VariantProps } from "class-variance-authority";

export const tagVariants = cva(
	"badge inline-flex min-h-7 min-w-fit items-center justify-center rounded-3xl px-4 py-0 text-sm font-medium leading-none",
	{
		variants: {
			skin: {
				pink: "border-none bg-[#fce7f3] text-[#e60076]",
				green: "border-none bg-[#dcfce7] text-[#008236]",
				red: "border-none bg-error/10 text-error",
				alt: "border-none bg-[#f6f3f4] text-foreground",
				yellow: "border-none bg-[#fef3c7] text-[#92400e]",
				blue: "border-none bg-[#dbeafe] text-[#1e40af]",
			},
		},
	},
);

export type TagVariants = VariantProps<typeof tagVariants>;
export type TagSkin = NonNullable<TagVariants["skin"]>;
