import Text from "@/components/Text";

const brands = [
	{
		name: "Forbes",
		className: "font-serif text-xl font-semibold tracking-tight",
	},
	{
		name: "TechCrunch",
		className: "font-sans text-lg font-semibold tracking-tight",
	},
	{
		name: "The Guardian",
		className: "font-serif text-lg tracking-tight",
		render: () => (
			<>
				<span className="font-normal">The </span>
				<span className="font-semibold">Guardian</span>
			</>
		),
	},
	{
		name: "Fast Company",
		className: "font-serif text-lg font-semibold italic tracking-tight",
	},
	{
		name: "Wired",
		className: "font-serif text-xl font-bold uppercase tracking-wider",
	},
	{
		name: "Inc.",
		className: "font-serif text-2xl font-semibold tracking-tight",
	},
	{
		name: "Bloomberg",
		className: "font-serif text-lg font-semibold tracking-tight",
	},
];

export function TrustedBySection() {
	return (
		<section className="border-t border-b border-gray-200 bg-[#FAF8F4] px-6 py-16 sm:py-20">
			<Text variant="trusted-by">Get featured in publications like</Text>

			<ul className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:mt-12 sm:gap-x-12 md:gap-x-14">
				{brands.map((brand) => (
					<li key={brand.name}>
						<span className={`text-gray-400 ${brand.className}`}>
							{brand.render ? brand.render() : brand.name}
						</span>
					</li>
				))}
			</ul>

			<Text
				variant="caption"
				className="mx-auto mt-10 max-w-2xl text-center leading-relaxed sm:mt-12"
			>
				We work directly with journalists and editors from leading titles who
				are actively looking for experts, founders and creatives to feature.
			</Text>
		</section>
	);
}
