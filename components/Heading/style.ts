import { cva, type VariantProps } from "class-variance-authority";

export const headingVariants = cva("font-display font-normal tracking-tight", {
	variants: {
		variant: {
			hero: "font-sans text-5xl font-bold tracking-tight normal-case text-black sm:text-6xl sm:leading-[1.1]",
			heroMarketing:
				"text-[48px] uppercase leading-[1.05] text-black sm:text-[76px] sm:leading-[1.05]",
			page: "text-2xl text-black sm:text-3xl",
			"page-lg": "text-3xl text-black",
			"page-profile": "mt-5 text-2xl text-black",
			"page-detail": "mt-4 text-2xl text-black sm:text-3xl sm:leading-tight",
			section: "text-3xl uppercase text-black sm:text-[44px] sm:leading-tight",
			"section-inverse":
				"text-3xl uppercase text-white sm:text-[44px] sm:leading-tight",
			subsection: "font-sans text-lg font-semibold tracking-normal text-black",
			"subsection-sm":
				"font-sans text-base font-semibold tracking-normal text-black",
			label:
				"font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400",
			form: "my-4 text-xl text-black",
			card: "font-sans text-base font-semibold tracking-normal text-black",
			"card-mt-4":
				"font-sans mt-4 text-base font-semibold tracking-normal text-black",
			"card-mt-5":
				"font-sans mt-5 text-base font-semibold tracking-normal text-black",
		},
	},
});

export type HeadingVariant = NonNullable<
	VariantProps<typeof headingVariants>["variant"]
>;

export const defaultHeadingVariantByLevel: Record<
	1 | 2 | 3 | 4 | 5 | 6,
	HeadingVariant
> = {
	1: "page",
	2: "section",
	3: "card",
	4: "card",
	5: "card",
	6: "card",
};
