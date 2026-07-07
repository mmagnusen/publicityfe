"use client";

import { useEffect, useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

import InputField from "@components/FormikFields/InputField";
import INPUT_TYPE from "@constants/inputTypes";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import useErrorReport from "@hooks/useErrorReport";
import { isPasswordTooSimilarToIdentity } from "@util/passwordPolicy";
import { applyRegistrationApiErrorsToForm } from "@util/registrationApiErrors";
import {
	emailValidation,
	firstNameValidation,
	lastNameValidation,
	registerAndPasswordResetPasswordValidation,
	usernameValidation,
} from "@util/yupValidationSchemas";

import Button from "@/components/Button";
import Text from "@/components/Text";

type RegisterFormValues = {
	firstName: string;
	lastName: string;
	email: string;
	username: string;
	password: string;
};

const validationSchema = Yup.object().shape({
	firstName: firstNameValidation,
	lastName: lastNameValidation,
	email: emailValidation,
	username: usernameValidation,
	password: registerAndPasswordResetPasswordValidation.test(
		"not-similar-to-identity",
		"This password is too similar to your email or name",
		(value, context) => {
			const {
				email = "",
				firstName = "",
				lastName = "",
				username = "",
			} = context.parent as RegisterFormValues;
			if (!value) return true;
			return !isPasswordTooSimilarToIdentity(value, {
				email,
				firstName,
				lastName,
				username,
			});
		},
	),
});

type RegisterFormProps = {
	disableRedirect?: boolean;
	onSuccess?: () => void;
	redirectTo?: string;
};

export function RegisterForm({
	disableRedirect = false,
	onSuccess,
	redirectTo = "/dashboard",
}: RegisterFormProps = {}) {
	const router = useRouter();
	const { authenticationChecked, funcRegister, isLoggedIn } =
		useAuthenticatedUser();
	const { reportError } = useErrorReport({
		functionNamePrefix: "RegisterForm",
	});
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		if (disableRedirect) {
			return;
		}

		if (authenticationChecked && isLoggedIn) {
			router.replace(redirectTo);
		}
	}, [authenticationChecked, disableRedirect, isLoggedIn, redirectTo, router]);

	const submitRegister = async (
		formikValues: RegisterFormValues,
		{ setFieldError }: FormikHelpers<RegisterFormValues>,
	) => {
		const { firstName, lastName, email, password, username } = formikValues;

		try {
			setFormError(null);
			await funcRegister(firstName, lastName, email, password, username);

			if (disableRedirect) {
				onSuccess?.();
			} else {
				router.replace(redirectTo);
			}
		} catch (error: unknown) {
			reportError(error, "registration_email_password", {
				scrubRequestKeys: ["password"],
			});
			const applied = applyRegistrationApiErrorsToForm(error, {
				setFieldError,
				setFormError,
			});
			if (!applied) {
				setFormError(
					"Unable to create a new account. Please check details and try again.",
				);
			}
		}
	};

	if (!authenticationChecked) {
		return <Text variant="center-sm">Checking your session…</Text>;
	}

	return (
		<Formik
			initialValues={{
				firstName: "",
				lastName: "",
				email: "",
				username: "",
				password: "",
			}}
			onSubmit={submitRegister}
			validationSchema={validationSchema}
		>
			{({ isSubmitting }) => (
				<Form className="space-y-5">
					<div className="grid gap-5 sm:grid-cols-2">
						<InputField
							bIsLoading={isSubmitting}
							name="firstName"
							nstrAutoComplete="given-name"
							placeHolder="Jane"
							strLabel="First name"
							type={INPUT_TYPE.TEXT}
						/>
						<InputField
							bIsLoading={isSubmitting}
							name="lastName"
							nstrAutoComplete="family-name"
							placeHolder="Smith"
							strLabel="Last name"
							type={INPUT_TYPE.TEXT}
						/>
					</div>

					<InputField
						bIsLoading={isSubmitting}
						name="email"
						placeHolder="you@example.com"
						strLabel="Email"
						type={INPUT_TYPE.EMAIL}
					/>

					<InputField
						bIsLoading={isSubmitting}
						name="username"
						placeHolder="yourname"
						strLabel="Username"
						type={INPUT_TYPE.TEXT}
					/>

					<InputField
						bIsLoading={isSubmitting}
						name="password"
						nstrAutoComplete="new-password"
						placeHolder="Create a password"
						strLabel="Password"
						type={INPUT_TYPE.PASSWORD}
					/>

					{formError ? (
						<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
							{formError}
						</div>
					) : null}

					<Button
						type="submit"
						bLoading={isSubmitting}
						isFullWidth
						textTransform="none"
					>
						{isSubmitting ? "Creating account…" : "Create Account"}
					</Button>

					<Text variant="legal">
						By creating an account, you agree to our Terms of Service and
						Privacy Policy.
					</Text>
				</Form>
			)}
		</Formik>
	);
}
