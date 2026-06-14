import { useField } from "formik";

import Input, { type InputProps } from "@components/Input";
import { debounce, isEmpty } from "lodash";

interface Props extends Omit<InputProps, "value"> {
	bUseDebounce?: boolean;
	name: string;
	onChangeCallback?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
	bUseDebounce = false,
	name,
	onChangeCallback,
	...restProps
}: Props) => {
	const [field, formikProps, helpers] = useField(name);
	const { setTouched, setValue } = helpers;
	const { error, touched } = formikProps;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.target.value);

		if (onChangeCallback) {
			if (bUseDebounce) {
				debounce(onChangeCallback, 2000)(event);
			} else {
				onChangeCallback(event);
			}
		}
	};

	const handleBlur = () => {
		setTouched(true);
	};

	return (
		<Input
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

export default InputField;
