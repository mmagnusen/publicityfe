import { cn } from "@/lib/cn";

type SectionHeaderProps = {
	className?: string;
	title: string;
};

export function SectionHeader({ className, title }: SectionHeaderProps) {
	return (
		<h3 className={cn("text-lg font-bold text-black", className)}>{title}</h3>
	);
}
