import * as Yup from "yup";

import {
	emailValidation,
	loginPasswordValidation,
} from "@util/yupValidationSchemas";

const validationSchema = Yup.object().shape({
	email: emailValidation,
	password: loginPasswordValidation,
});

export type LoginFormValues = {
	email: string;
	password: string;
};

export default validationSchema;
