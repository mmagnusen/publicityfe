"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import usePosthog from "@hooks/usePosthog";

import Button from "@/components/Button";
import InputField from "@/components/FormikFields/InputField";
import TextAreaField from "@/components/FormikFields/TextAreaField";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { emailValidation } from "@/util/yupValidationSchemas";

type FormValues = {
	email: string;
	message: string;
	name: string;
};

const validationSchema = Yup.object().shape({
	email: emailValidation,
	message: Yup.string().trim().required("Message is required"),
	name: Yup.string().trim().required("Name is required"),
});

type Props = {
	isOpen: boolean;
	onClose: () => void;
};

export function ContactQueryModal({ isOpen, onClose }: Props) {
	const { authenticatedUser, isLoggedIn } = useAuthenticatedUser();
	const { capturePosthogEvent } = usePosthog();
	const [submitted, setSubmitted] = useState(false);

	const initialValues = useMemo<FormValues>(
		() => ({
			email: isLoggedIn ? (authenticatedUser?.email ?? "") : "",
			message: "",
			name: isLoggedIn
				? `${authenticatedUser?.firstName ?? ""} ${authenticatedUser?.lastName ?? ""}`.trim()
				: "",
		}),
		[
			authenticatedUser?.email,
			authenticatedUser?.firstName,
			authenticatedUser?.lastName,
			isLoggedIn,
		],
	);

	useEffect(() => {
		if (!isOpen) {
			setSubmitted(false);
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	const handleSubmit = async (
		values: FormValues,
		{ resetForm }: { resetForm: () => void },
	) => {
		capturePosthogEvent("contact_form_submission", {
			channel: "contact-form",
			description: `Contact query from ${values.email}`,
			functionName: "ContactQueryModal > handleSubmit",
		});

		await new Promise((resolve) => {
			setTimeout(resolve, 800);
		});

		resetForm();
		setSubmitted(true);
		toast.success("Message sent. We'll get back to you soon.");
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				aria-label="Close contact form"
				className="absolute inset-0 bg-black/40"
				onClick={onClose}
				type="button"
			/>

			<div
				aria-labelledby="contact-query-title"
				aria-modal="true"
				className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
				role="dialog"
			>
				<div className="flex items-start justify-between gap-4">
					<Heading level={2} id="contact-query-title" variant="subsection">
						Send a query
					</Heading>
					<Button
						onClick={onClose}
						size="small"
						strVariant="transparentWithBorder"
						textTransform="none"
						type="button"
					>
						Close
					</Button>
				</div>

				<Text variant="card-body" className="mt-2">
					Tell us what you need and we&apos;ll get back to you by email.
				</Text>

				{submitted ? (
					<div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
						Thank you for your message. We&apos;ll get back to you as soon as
						possible.
					</div>
				) : (
					<Formik
						enableReinitialize
						initialValues={initialValues}
						onSubmit={handleSubmit}
						validationSchema={validationSchema}
					>
						{(props) => (
							<Form className="mt-6 space-y-1">
								<InputField name="name" strLabel="Your name" />
								<InputField name="email" strLabel="Your email address" />
								<TextAreaField name="message" strLabel="Your message" />

								<div className="pt-4">
									<Button
										bLoading={props.isSubmitting}
										isDisabled={props.isSubmitting || !props.isValid}
										isFullWidth
										textTransform="none"
										type="submit"
									>
										Send message
									</Button>
								</div>
							</Form>
						)}
					</Formik>
				)}
			</div>
		</div>
	);
}
