import type { ChangeEvent } from "react";
import { mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";

import type { Validation } from "@customTypes/index";

import {
	editIconVariants,
	fieldMessageVariants,
	labelledFieldVariants,
	labelRowVariants,
	textAreaControlVariants,
} from "../FormField/style";

export type TextAreaProps = {
	bDisabled?: boolean;
	maxLength?: number;
	objValidation?: Validation;
	onBlur?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onEditButtonClick?: () => void;
	placeHolder?: string;
	strLabel?: string;
	strHelperMessage?: string;
	value: string;
};

const TextArea = ({
	bDisabled = false,
	maxLength,
	value,
	objValidation = {
		bIsValid: true,
		strErrorMessage: "",
	},
	onChange,
	onBlur,
	onEditButtonClick,
	placeHolder = "",
	strLabel,
	strHelperMessage,
}: TextAreaProps) => {
	const hasValidationMessage =
		objValidation.bIsValid === false && Boolean(objValidation.strErrorMessage);

	const textAreaState = bDisabled
		? "disabled"
		: objValidation.bIsValid === false
			? "invalid"
			: "valid";

	return (
		<section className={labelledFieldVariants()}>
			<div className={labelRowVariants()}>
				{strLabel ? <label htmlFor="textarea">{strLabel}</label> : null}
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
			<textarea
				className={textAreaControlVariants({ state: textAreaState })}
				disabled={bDisabled}
				id="textarea"
				maxLength={maxLength}
				onBlur={onBlur}
				onChange={onChange}
				placeholder={placeHolder}
				value={value}
			/>
			{hasValidationMessage ? (
				<span className={fieldMessageVariants({ kind: "error" })}>
					{objValidation.strErrorMessage}
				</span>
			) : null}
			{!hasValidationMessage && strHelperMessage ? (
				<span className={fieldMessageVariants({ kind: "helper" })}>
					{strHelperMessage}
				</span>
			) : null}
		</section>
	);
};

export default TextArea;
