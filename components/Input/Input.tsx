import {
	type FocusEventHandler,
	forwardRef,
	type KeyboardEventHandler,
	useState,
} from "react";
import { mdiEye, mdiEyeOff, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";

import Skeleton from "@components/Skeletons/Skeleton/Skeleton";
import type { InputEvent } from "@constants/events";
import INPUT_TYPE from "@constants/inputTypes";
import { objDefaultValidation } from "@constants/validation";
import type { Validation } from "@customTypes/index";

import {
	editIconVariants,
	fieldMessageVariants,
	inputControlVariants,
	inputPrefixVariants,
	inputWrapperVariants,
	labelledFieldVariants,
	labelRowVariants,
	showPasswordIconVariants,
} from "../FormField/style";

export type InputProps = {
	bCompact?: boolean;
	bDisabled?: boolean;
	bHideInlineMessages?: boolean;
	bIsLoading?: boolean;
	id?: string;
	maxLength?: number;
	nstrAutoComplete?: string;
	objValidation?: Validation;
	onBlur?: FocusEventHandler<HTMLInputElement>;
	onChange?: (event: InputEvent) => void;
	onEditButtonClick?: () => void;
	onFocus?: FocusEventHandler<HTMLInputElement>;
	onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
	onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	placeHolder?: string;
	prefix?: string;
	prefixIconPath?: string;
	strLabel?: string;
	strHelperMessage?: string;
	type?: INPUT_TYPE;
	value?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			bCompact = false,
			bDisabled = false,
			bHideInlineMessages = false,
			bIsLoading = false,
			id,
			maxLength,
			nstrAutoComplete,
			objValidation = objDefaultValidation,
			onBlur,
			onChange,
			onEditButtonClick,
			onFocus,
			onKeyDown,
			onKeyPress,
			placeHolder,
			prefix,
			prefixIconPath,
			value,
			type,
			strLabel,
			strHelperMessage,
		},
		ref,
	) => {
		const [bShowPassword, setShowPassword] = useState(false);
		const hasPrefix = Boolean(prefix || prefixIconPath);

		const getPlaceholder = () => {
			if (type === INPUT_TYPE.PASSWORD) return "Password";
			return placeHolder || "";
		};

		const showInvalidBorder =
			objValidation.bIsValid === false && !objValidation.bMutedMessage;
		const hasValidationMessage =
			objValidation.bIsValid === false &&
			Boolean(objValidation.strErrorMessage);

		const getType = () => {
			if (type === INPUT_TYPE.EMAIL) return INPUT_TYPE.EMAIL;
			if (type === INPUT_TYPE.NUMBER) return INPUT_TYPE.NUMBER;
			if (type === INPUT_TYPE.DATE) return INPUT_TYPE.DATE;
			if (type === INPUT_TYPE.PASSWORD) {
				return bShowPassword ? INPUT_TYPE.TEXT : INPUT_TYPE.PASSWORD;
			}
			return INPUT_TYPE.TEXT;
		};

		const inputState = bDisabled
			? "disabled"
			: showInvalidBorder
				? "invalid"
				: "valid";

		const inputControl = (
			<section className={inputWrapperVariants()}>
				{bIsLoading ? (
					<Skeleton height="40px" width="100%" />
				) : (
					<>
						{hasPrefix ? (
							<span className={inputPrefixVariants()}>
								{prefixIconPath ? (
									<Icon path={prefixIconPath} size={0.8} />
								) : (
									prefix
								)}
							</span>
						) : null}
						<input
							ref={ref}
							autoComplete={nstrAutoComplete}
							className={inputControlVariants({
								state: inputState,
								withPrefix: hasPrefix,
							})}
							disabled={bDisabled}
							id={id ?? getType()}
							maxLength={maxLength}
							onBlur={onBlur}
							onChange={onChange}
							onFocus={onFocus}
							onKeyDown={onKeyDown}
							onKeyPress={onKeyPress}
							placeholder={getPlaceholder()}
							type={getType()}
							value={value}
						/>
					</>
				)}
				{type === INPUT_TYPE.PASSWORD ? (
					<div
						className={showPasswordIconVariants()}
						onClick={() => setShowPassword((prevState) => !prevState)}
						onKeyDown={() => void 0}
						role="button"
						tabIndex={0}
					>
						<Icon
							horizontal
							path={bShowPassword ? mdiEye : mdiEyeOff}
							rotate={180}
							size={1}
							title="Toggle password visibility"
							vertical
						/>
					</div>
				) : null}
				{!bHideInlineMessages &&
				maxLength &&
				(value?.length ?? 0) >= maxLength ? (
					<span className={fieldMessageVariants({ kind: "error" })}>
						{`Maxmimum ${maxLength} characters`}
					</span>
				) : null}
				{!bHideInlineMessages && hasValidationMessage ? (
					<span
						className={fieldMessageVariants({
							kind: objValidation.bMutedMessage ? "helper" : "error",
						})}
					>
						{objValidation.strErrorMessage}
					</span>
				) : null}
				{!bHideInlineMessages && !hasValidationMessage && strHelperMessage ? (
					<span className={fieldMessageVariants({ kind: "helper" })}>
						{strHelperMessage}
					</span>
				) : null}
			</section>
		);

		if (bCompact) {
			return inputControl;
		}

		return (
			<div className={labelledFieldVariants()}>
				<div className={labelRowVariants()}>
					{strLabel ? (
						<label htmlFor={id ?? getType()}>{strLabel}</label>
					) : null}
					{onEditButtonClick ? (
						<div
							className={editIconVariants()}
							onClick={onEditButtonClick}
							onKeyDown={() => void 0}
							role="button"
							tabIndex={0}
						>
							<Icon
								horizontal
								path={mdiPencil}
								rotate={180}
								size={0.6}
								vertical
							/>
						</div>
					) : null}
				</div>
				{inputControl}
			</div>
		);
	},
);

Input.displayName = "Input";

export default Input;
