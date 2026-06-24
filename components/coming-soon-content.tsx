"use client";

import { useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";

import useErrorReport from "@hooks/useErrorReport";
import usePosthog from "@hooks/usePosthog";

import Button from "@/components/Button";
import InputField from "@/components/FormikFields/InputField";
import Heading from "@/components/Heading";
import { LogoLink } from "@/components/Navigation/LogoLink";
import { RotatingWord } from "@/components/rotating-word";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";
import { applyWaitlistApiErrorsToForm, joinWaitlist } from "@/lib/waitlist";
import {
	emailValidation,
	firstNameValidation,
} from "@/util/yupValidationSchemas";

type WaitlistFormValues = {
	firstName: string;
	email: string;
};

const validationSchema = Yup.object().shape({
	firstName: firstNameValidation,
	email: emailValidation,
});

export function ComingSoonContent() {
	const { capturePosthogEvent } = usePosthog();
	const { reportError } = useErrorReport({
		functionNamePrefix: "ComingSoonContent",
	});
	const [submitted, setSubmitted] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const handleSubmit = async (
		values: WaitlistFormValues,
		{ setFieldError }: FormikHelpers<WaitlistFormValues>,
	) => {
		try {
			setFormError(null);
			await joinWaitlist(values);

			capturePosthogEvent("waitlist_signup", {
				channel: "coming-soon",
				description: `Waitlist signup: ${values.firstName} <${values.email}>`,
				firstName: values.firstName,
				email: values.email,
				functionName: "ComingSoonContent > handleSubmit",
			});

			setSubmitted(true);
		} catch (error: unknown) {
			reportError(error, "waitlist_join");
			const applied = applyWaitlistApiErrorsToForm(error, {
				setFieldError,
				setFormError,
			});
			if (!applied) {
				setFormError(
					"Unable to join the waitlist. Please check your details and try again.",
				);
			}
		}
	};

	return (
		<div className="flex min-h-full flex-col bg-white font-sans">
			<header className="border-b border-gray-200 px-6 py-4">
				<div className="mx-auto flex max-w-3xl items-center justify-center sm:justify-start">
					<LogoLink />
				</div>
			</header>

			<main className="flex flex-1 items-center px-6 py-16 sm:py-24">
				<div className="mx-auto w-full max-w-md text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
						Coming soon
					</p>
					<Heading level={1} variant="hero" className="mt-4">
						Get featured in
						<br />
						<RotatingWord />
					</Heading>
					<p className="mt-8 text-lg leading-relaxed text-gray-600">
						We&apos;re building {TRADING_NAME}, a new platform that connects
						founders with press, podcasts, panels and more - without the PR
						agency price tag. Join the waitlist for early access and exclusive
						founding member perks.
					</p>

					{submitted ? (
						<div
							className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-900"
							role="status"
						>
							Thanks- you&apos;re on the list. We&apos;ll be in touch soon.
						</div>
					) : (
						<Formik
							initialValues={{ firstName: "", email: "" }}
							onSubmit={handleSubmit}
							validationSchema={validationSchema}
						>
							{(props) => (
								<Form className="mt-8">
									<div className="flex flex-col gap-3 text-left">
										<InputField
											name="firstName"
											placeHolder="Jane"
											strLabel="First name"
										/>
										<InputField
											name="email"
											placeHolder="you@example.com"
											strLabel="Email address"
										/>
										{formError ? (
											<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
												{formError}
											</div>
										) : null}
										<Button
											bLoading={props.isSubmitting}
											isDisabled={props.isSubmitting || !props.isValid}
											isFullWidth
											textTransform="none"
											type="submit"
										>
											Join the waitlist
										</Button>
									</div>
								</Form>
							)}
						</Formik>
					)}

					<Text variant="caption" className="mt-6">
						No spam. Unsubscribe anytime.
					</Text>
				</div>
			</main>
		</div>
	);
}
