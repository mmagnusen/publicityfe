import HelperText from "@components/FormikFields/HelperText";
import type { Validation } from "@customTypes/index";
import ReactSelect, {
	type GroupBase,
	type MultiValue,
	type SingleValue,
} from "react-select";

import {
	fieldMessageVariants,
	labelledFieldVariants,
	labelRowVariants,
} from "../FormField/style";

export type SelectOption = {
	label: string;
	value: string;
};

export type SelectProps = {
	arrOptions: SelectOption[];
	bCompact?: boolean;
	bHideInlineMessages?: boolean;
	bShowSelectedTick?: boolean;
	defaultValue?: SelectOption | SelectOption[];
	id?: string;
	helperText?: string;
	placeholder?: string;
	isDisabled?: boolean;
	isClearable?: boolean;
	isMulti?: boolean;
	isSearchable?: boolean;
	objValidation?: Validation;
	onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
	onChange: (
		value: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => void;
	strLabel?: string;
	value?: SelectOption | SelectOption[];
};

const Select = ({
	arrOptions,
	bCompact = false,
	bHideInlineMessages = false,
	helperText,
	id,
	placeholder,
	isDisabled = false,
	isClearable = false,
	isMulti = false,
	isSearchable = true,
	onChange,
	onBlur,
	value,
	objValidation = {
		bIsValid: true,
		strErrorMessage: "",
	},
	strLabel,
	...props
}: SelectProps) => {
	const customStyles = {
		control: (baseStyles: Record<string, unknown>) => ({
			...baseStyles,
			borderColor: objValidation.bIsValid === false ? "#ef4444" : "#9ca3af",
			minHeight: "40px",
			borderRadius: "4px",
		}),
		menuPortal: (baseStyles: Record<string, unknown>) => ({
			...baseStyles,
			zIndex: 9999,
		}),
	};

	const menuPortalTarget =
		typeof document !== "undefined" ? document.body : undefined;

	const selectControl = (
		<ReactSelect<SelectOption, boolean, GroupBase<SelectOption>>
			inputId={id ?? "select"}
			isClearable={isClearable}
			isDisabled={isDisabled}
			isMulti={isMulti}
			isSearchable={isSearchable}
			menuPlacement="auto"
			menuPortalTarget={menuPortalTarget}
			menuPosition="fixed"
			onBlur={onBlur}
			onChange={onChange}
			options={arrOptions}
			placeholder={placeholder}
			styles={customStyles}
			value={value}
			{...props}
		/>
	);

	if (bCompact) {
		return selectControl;
	}

	return (
		<section className={labelledFieldVariants()}>
			<div className={labelRowVariants()}>
				{strLabel ? <label htmlFor={id ?? "select"}>{strLabel}</label> : null}
			</div>
			{selectControl}
			{!bHideInlineMessages && objValidation.bIsValid === false ? (
				<span className={fieldMessageVariants({ kind: "error" })}>
					{objValidation.strErrorMessage}
				</span>
			) : null}
			{!bHideInlineMessages &&
			objValidation.bIsValid !== false &&
			helperText ? (
				<HelperText>{helperText}</HelperText>
			) : null}
		</section>
	);
};

export default Select;
