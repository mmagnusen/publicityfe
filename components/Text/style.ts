import { cva, type VariantProps } from "class-variance-authority";

export const textVariants = cva("", {
	variants: {
		variant: {
			body: "text-base text-gray-500",
			plain: "",
			"section-lead": "mt-3 text-base text-gray-500 sm:text-lg",
			"section-lead-relaxed":
				"mt-4 text-base leading-relaxed text-gray-500 sm:text-lg",
			"section-lead-inverse":
				"mt-4 text-base leading-relaxed text-[#c9c5b8] sm:text-lg",
			"hero-lead": "mt-6 max-w-xl text-[19px] leading-relaxed text-[#4A473F]",
			"hero-note": "mt-4 text-sm text-gray-400",
			"card-body": "mt-2 text-sm leading-relaxed text-gray-500",
			"card-body-narrow": "mt-2 max-w-xs text-sm leading-relaxed text-gray-500",
			caption: "mt-6 text-sm text-gray-500",
			"auth-description": "mt-2 text-sm text-gray-500 sm:text-base",
			"auth-footer": "mt-6 text-center text-sm text-gray-500",
			eyebrow: "text-xs font-semibold uppercase tracking-widest text-gray-400",
			"plan-description": "mt-3 text-sm leading-relaxed text-gray-500",
			"plan-description-muted":
				"relative mt-3 text-sm leading-relaxed text-gray-400",
			"plan-footnote": "mt-3 text-center text-xs text-gray-500",
			"benefit-title": "text-sm font-semibold text-black",
			"benefit-description": "mt-0.5 text-sm text-gray-500",
			"profile-role": "mt-1 text-sm text-gray-600",
			"profile-location":
				"mt-2 flex items-center gap-1.5 text-sm text-gray-500",
			label:
				"text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400",
			sm: "text-sm",
			"detail-label": "text-xs text-gray-500",
			"detail-value": "mt-1 text-sm font-semibold text-black",
			"detail-value-medium": "text-sm font-medium text-black",
			"reporter-title": "text-sm text-gray-500",
			"reporter-publication": "mt-0.5 text-sm font-medium text-violet-600",
			"reporter-bio": "mt-4 text-center text-sm leading-relaxed text-gray-500",
			"publication-name": "text-sm font-semibold text-black",
			"publication-domain": "text-xs text-gray-500",
			"sidebar-heading": "text-sm font-medium text-gray-600",
			"match-score": "mt-2",
			"sidebar-footnote": "mt-3 text-xs leading-relaxed text-gray-500",
			loading: "text-sm text-gray-500",
			"page-subtitle": "mt-2 text-gray-500",
			"stat-label": "text-sm font-medium text-gray-500",
			"stat-value": "mt-2 text-3xl font-bold text-black",
			error:
				"m-0 p-2 text-sm text-error [&_li]:m-0 [&_li]:p-2 [&_li]:text-sm [&_li]:text-error",
			"center-sm": "text-center text-sm text-gray-500",
			"trusted-by":
				"text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-400",
			legal: "text-center text-xs leading-relaxed text-gray-400",
		},
	},
	defaultVariants: {
		variant: "body",
	},
});

export type TextVariant = NonNullable<
	VariantProps<typeof textVariants>["variant"]
>;
