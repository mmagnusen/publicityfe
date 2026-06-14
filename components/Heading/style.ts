import { cva, type VariantProps } from "class-variance-authority";

export const headingVariants = cva("", {
	variants: {
		variant: {
			hero: "text-5xl font-bold tracking-tight text-black sm:text-6xl sm:leading-[1.1]",
			page: "text-2xl font-bold tracking-tight text-black sm:text-3xl",
			"page-lg": "text-3xl font-bold tracking-tight text-black",
			"page-profile": "mt-5 text-2xl font-bold tracking-tight text-black",
			"page-detail":
				"mt-4 text-2xl font-bold tracking-tight text-black sm:text-3xl sm:leading-tight",
			section: "text-3xl font-bold tracking-tight text-black sm:text-4xl",
			"section-inverse":
				"text-3xl font-bold tracking-tight text-white sm:text-4xl",
			subsection: "text-lg font-semibold text-black",
			"subsection-sm": "text-base font-semibold text-black",
			label:
				"text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400",
			form: "my-4 text-xl font-bold text-black",
			card: "text-base font-semibold text-black",
			"card-mt-4": "mt-4 text-base font-semibold text-black",
			"card-mt-5": "mt-5 text-base font-semibold text-black",
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
