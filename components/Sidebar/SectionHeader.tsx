type SectionHeaderProps = {
	title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
	return <h3 className="px-2 text-lg font-bold text-black">{title}</h3>;
}
