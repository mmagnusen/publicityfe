import type { ChangeEvent } from "react";
import { useField } from "formik";

import TextArea, { type TextAreaProps } from "@components/TextArea";
import { isEmpty } from "lodash";

interface Props extends Omit<TextAreaProps, "value"> {
	name: string;
}

const TextAreaField = ({ name, ...restProps }: Props) => {
	const [field, formikProps, helpers] = useField(name);
	const { setTouched, setValue } = helpers;
	const { error, touched } = formikProps;

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);
	};

	const handleBlur = () => {
		setTouched(true);
	};

	return (
		<TextArea
			{...field}
			{...restProps}
			objValidation={{
				bIsValid: touched ? isEmpty(formikProps.error) : true,
				strErrorMessage: touched ? (error as string) : "",
			}}
			onBlur={handleBlur}
			onChange={handleChange}
			value={field.value}
		/>
	);
};

export default TextAreaField;
