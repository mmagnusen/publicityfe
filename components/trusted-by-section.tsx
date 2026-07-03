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

import Text from "@/components/Text";

export function TrustedBySection() {
	return (
		<section className="border-t border-b border-gray-200 bg-white px-6 py-12 sm:py-14">
			<Text variant="trusted-by">Land coverage in publications like</Text>

			<ul className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-12 md:gap-x-14">
				{brands.map((brand) => (
					<li key={brand.name}>
						<span className={`text-gray-400 ${brand.className}`}>
							{brand.render ? brand.render() : brand.name}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
