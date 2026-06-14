import { fieldVariants } from "./style";

type Props = {
	children: React.ReactNode;
	fieldLabel?: string;
	fieldName: string;
};

const Field = ({ fieldName, children, fieldLabel }: Props) => {
	return (
		<div className={fieldVariants()}>
			<label htmlFor={fieldName}>{fieldLabel}</label>
			{children}
		</div>
	);
};

export default Field;
