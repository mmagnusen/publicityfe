import { useField } from "formik";

import Select, { type SelectProps } from "@components/Select";
import type { SelectOption } from "@components/Select/Select";
import { isEmpty } from "lodash";
import type { MultiValue, SingleValue } from "react-select";

export interface SelectFieldProps
	extends Omit<SelectProps, "value" | "onChange"> {
	name: string;
	onChangeCallback?: (
		option: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => void;
}

const SelectField = ({
	name,
	onChangeCallback,
	...restProps
}: SelectFieldProps) => {
	const [field, formikProps, helpers] = useField(name);
	const { setTouched, setValue } = helpers;
	const { error, touched } = formikProps;

	const handleChange = (
		option: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => {
		setValue(option);
		onChangeCallback?.(option);
	};

	const handleBlur = () => {
		setTouched(true);
	};

	return (
		<Select
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

export default SelectField;
