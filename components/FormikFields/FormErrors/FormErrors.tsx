import type { HandleAxiosFormErrors } from "@customTypes/index";

import Text from "@/components/Text";
import { formErrorVariants } from "./style";

type Props = {
	formErrors: HandleAxiosFormErrors;
	formTouchedSinceLastSubmit: boolean;
};

const FormErrors = ({ formErrors, formTouchedSinceLastSubmit }: Props) => {
	const formErrorsEntries = Object.entries(formErrors);

	if (formErrorsEntries.length === 0) return null;

	if (formTouchedSinceLastSubmit) return null;

	return (
		<div className={formErrorVariants()}>
			<Text variant="error">
				Please check details and try again.
				<ul>
					{Object.entries(formErrors)?.map(([key, errorsArray]) => {
						return errorsArray?.map((error) => (
							<li key={`${key}-${error}`}>{`${key}: ${error}`}</li>
						));
					})}
				</ul>
			</Text>
		</div>
	);
};

export default FormErrors;
