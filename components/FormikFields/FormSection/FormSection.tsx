import Heading from "@/components/Heading";
import { formSectionVariants } from "./style";

type Props = {
	children: React.ReactNode;
	title?: string;
};

const FormSection = ({ children, title }: Props) => {
	return (
		<div className={formSectionVariants()}>
			{title ? (
				<Heading level={2} variant="form">
					{title}
				</Heading>
			) : null}
			{children}
		</div>
	);
};

export default FormSection;
