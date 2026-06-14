import { cn } from "@/lib/cn";
import { helperTextVariants } from "./style";

type Props = {
	children: React.ReactNode;
	marginBottom?: string;
};

const HelperText = ({ children, marginBottom }: Props) => {
	if (!children) {
		return null;
	}

	return (
		<span
			className={helperTextVariants()}
			style={marginBottom ? { marginBottom } : undefined}
		>
			{children}
		</span>
	);
};

export default HelperText;
