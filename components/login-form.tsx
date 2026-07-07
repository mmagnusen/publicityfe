"use client";

import { useEffect, useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";

import InputField from "@components/FormikFields/InputField";
import INPUT_TYPE from "@constants/inputTypes";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import useErrorReport from "@hooks/useErrorReport";
import { isLikelyNetworkError } from "@util/errorReporting";
import { parseLoginApiError } from "@util/loginApiErrors";

import Button from "@/components/Button";
import Text from "@/components/Text";
import validationSchema, {
	type LoginFormValues,
} from "./login-form-validation";

type LoginFormProps = {
	disableRedirect?: boolean;
	onSuccess?: () => void;
	redirectTo?: string;
};

export function LoginForm({
	disableRedirect = false,
	onSuccess,
	redirectTo = "/dashboard",
}: LoginFormProps = {}) {
	const router = useRouter();
	const { authenticationChecked, funcLogin, isLoggedIn } =
		useAuthenticatedUser();
	const { reportError } = useErrorReport({
		functionNamePrefix: "LoginForm",
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

	const submitLogin = async (
		formikValues: LoginFormValues,
		{ setFieldError }: FormikHelpers<LoginFormValues>,
	) => {
		const fallbackMessage =
			"Unable to sign in. Please check your details and try again.";

		if (authenticationChecked && isLoggedIn) {
			if (disableRedirect) {
				onSuccess?.();
			} else {
				router.replace(redirectTo);
			}
			return;
		}

		try {
			setFormError(null);
			setFieldError("email", undefined);
			setFieldError("password", undefined);

			await funcLogin(formikValues.email, formikValues.password);

			if (disableRedirect) {
				onSuccess?.();
			} else {
				router.replace(redirectTo);
			}
		} catch (error: unknown) {
			const { formMessage, email, password } = parseLoginApiError(error);

			if (email) {
				setFieldError("email", email);
			}
			if (password) {
				setFieldError("password", password);
			}
			if (formMessage) {
				setFormError(formMessage);
			} else if (!email && !password) {
				setFormError(
					isLikelyNetworkError(error)
						? "Unable to reach the server. Check your connection and try again."
						: fallbackMessage,
				);
			} else {
				setFormError(null);
			}

			reportError(error, "login_email_password_submit", {
				scrubRequestKeys: ["password"],
			});
		}
	};

	if (!authenticationChecked) {
		return <Text variant="center-sm">Checking your session…</Text>;
	}

	return (
		<Formik
			initialValues={{
				email: "",
				password: "",
			}}
			onSubmit={submitLogin}
			validationSchema={validationSchema}
		>
			{({ isSubmitting, setFieldError }) => {
				const clearErrorsOnChange = () => {
					setFormError(null);
				};

				return (
					<Form className="space-y-5">
						{formError ? (
							<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{formError}
							</div>
						) : null}

						<InputField
							name="email"
							onChangeCallback={() => {
								clearErrorsOnChange();
								setFieldError("email", undefined);
							}}
							placeHolder="you@example.com"
							strLabel="Email"
							type={INPUT_TYPE.EMAIL}
						/>

						<div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-black">Password</span>
								<Link
									href="#"
									className="text-sm text-gray-500 transition-colors hover:text-black"
								>
									Forgot password?
								</Link>
							</div>
							<InputField
								name="password"
								nstrAutoComplete="current-password"
								onChangeCallback={() => {
									clearErrorsOnChange();
									setFieldError("password", undefined);
								}}
								placeHolder="Enter your password"
								type={INPUT_TYPE.PASSWORD}
							/>
						</div>

						<Button
							type="submit"
							bLoading={isSubmitting}
							isFullWidth
							textTransform="none"
						>
							{isSubmitting ? "Signing in…" : "Sign In"}
						</Button>
					</Form>
				);
			}}
		</Formik>
	);
}
