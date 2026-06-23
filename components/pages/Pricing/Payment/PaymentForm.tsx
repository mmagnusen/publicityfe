"use client";

import { useCallback, useMemo, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { mdiCheckboxMarkedCircleOutline } from "@mdi/js";
import Icon from "@mdi/react";
import {
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import type { StripeError } from "@stripe/stripe-js";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { type PricingOption } from "@hooks/useBilling";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import usePosthog from "@hooks/usePosthog";
import {
	type PromoValidatedDetails,
	validatePromoCode,
} from "@hooks/usePromoCode";

import Button from "@/components/Button";
import InputField from "@/components/FormikFields/InputField";
import {
	PaymentPlanSummary,
	type PromoPriceRow,
} from "@/components/pages/Pricing/Pricing/PricingCard/PricingCard";
import Text from "@/components/Text";
import priceConverter from "@/util/priceConverter";

export type CreateIntentResponse = {
	client_secret: string;
};

type PaymentFormValues = {
	discountCode: string;
	email: string;
	firstName: string;
	lastName: string;
};

const paymentFormSchema = Yup.object().shape({
	discountCode: Yup.string(),
	email: Yup.string().email("Enter a valid email").required("Required"),
	firstName: Yup.string().required("Required"),
	lastName: Yup.string().required("Required"),
});

type Props = {
	baseAmountPence: number;
	chargeAmountPence: number;
	planNumericId: number;
	prefillPromoCode: string;
	pricingOption: PricingOption;
	setPromoAdjustedPence: (pence: number | null) => void;
};

export function PaymentForm({
	baseAmountPence,
	chargeAmountPence,
	planNumericId,
	prefillPromoCode,
	pricingOption,
	setPromoAdjustedPence,
}: Props) {
	const { authenticatedUser, isLoggedIn } = useAuthenticatedUser();
	const stripe = useStripe();
	const elements = useElements();
	const { capturePosthogEvent } = usePosthog();
	const { reportError } = useErrorReport({ functionNamePrefix: "PaymentForm" });

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitButtonLoading, setIsSubmitButtonLoading] = useState(false);
	const [formTouchedSinceLastSubmit, setFormTouchedSinceLastSubmit] =
		useState(false);
	const [appliedPromo, setAppliedPromo] =
		useState<PromoValidatedDetails | null>(null);
	const [promoApplyError, setPromoApplyError] = useState<string | null>(null);
	const [isApplyingPromo, setIsApplyingPromo] = useState(false);

	const clearAppliedPromo = useCallback(() => {
		setAppliedPromo(null);
		setPromoApplyError(null);
		setPromoAdjustedPence(null);
	}, [setPromoAdjustedPence]);

	const handleApplyPromo = async (code: string) => {
		const trimmed = code.trim();
		setPromoApplyError(null);
		if (!trimmed) {
			setPromoApplyError("Enter a code to apply.");
			return;
		}
		setIsApplyingPromo(true);
		const result = await validatePromoCode(trimmed, planNumericId);
		setIsApplyingPromo(false);
		if (!result.valid) {
			setAppliedPromo(null);
			setPromoAdjustedPence(null);
			setPromoApplyError("This code is not valid for this plan.");
			return;
		}
		const { valid: _valid, ...details } = result;
		if (
			details.discount_kind === "full_waiver" &&
			details.amount_payable_pence === 0 &&
			!details.requires_payment &&
			details.duration_months > 0
		) {
			setAppliedPromo(null);
			setPromoAdjustedPence(null);
			setPromoApplyError(
				"Complimentary access is applied during registration, not at checkout.",
			);
			return;
		}

		setAppliedPromo(details);
		setPromoAdjustedPence(details.amount_payable_pence);
	};

	const promoOriginalListPence: number | null =
		appliedPromo == null
			? null
			: appliedPromo.list_price_pence > 0
				? appliedPromo.list_price_pence
				: baseAmountPence;

	const promoPercentOff: number | null =
		appliedPromo != null &&
		appliedPromo.discount_pence > 0 &&
		promoOriginalListPence != null &&
		promoOriginalListPence > 0
			? Math.round((appliedPromo.discount_pence / promoOriginalListPence) * 100)
			: null;

	const promoPriceRow: PromoPriceRow | null = appliedPromo
		? {
				listPence: promoOriginalListPence ?? baseAmountPence,
				payablePence: chargeAmountPence,
			}
		: null;

	const handleSubmit = async ({
		event,
		formValues,
	}: {
		event: React.MouseEvent<HTMLButtonElement>;
		formValues: PaymentFormValues;
	}) => {
		event.preventDefault();

		if (elements == null) {
			return;
		}

		setIsSubmitButtonLoading(true);

		const { error: submitError }: { error?: StripeError } =
			await elements.submit();
		if (submitError) {
			setErrorMessage(
				submitError.message ??
					"An error occurred while processing your payment.",
			);
			setIsSubmitButtonLoading(false);
			reportError(
				submitError,
				"handleSubmit_stripeSubmit",
				REPORT_POSTHOG_ONLY,
			);
			return;
		}

		const res = await fetch("/api/stripe/create-intent", {
			body: JSON.stringify({
				amount: chargeAmountPence,
				email: formValues.email,
				first_name: formValues.firstName,
				last_name: formValues.lastName,
				plan_id: planNumericId,
				purchase_type: "subscription",
				...(appliedPromo
					? {
							list_price_pence: promoOriginalListPence ?? baseAmountPence,
							promo_code: appliedPromo.code,
							promo_pk: appliedPromo.promo_pk,
						}
					: {}),
			}),
			method: "POST",
		});

		const { client_secret: clientSecret }: CreateIntentResponse =
			await res.json();

		capturePosthogEvent("subscription_purchase", {
			description: `New subscription purchase for plan: ${pricingOption.name} by user: ${formValues.email}`,
			functionName: "PaymentForm > handleSubmit",
		});

		const confirmationResult = await stripe?.confirmPayment({
			clientSecret,
			confirmParams: {
				receipt_email: formValues.email,
				return_url: `${window.location.origin}/pricing/confirmation`,
			},
			elements,
		});

		const confirmationError = confirmationResult?.error;
		if (confirmationError) {
			setErrorMessage(confirmationError.message ?? null);
			reportError(
				confirmationError,
				"handleSubmit_confirmation",
				REPORT_POSTHOG_ONLY,
			);
		}

		setIsSubmitButtonLoading(false);
	};

	const initialValues: PaymentFormValues = useMemo(
		() => ({
			discountCode: prefillPromoCode || "",
			email: isLoggedIn ? authenticatedUser?.email || "" : "",
			firstName: isLoggedIn ? authenticatedUser?.firstName || "" : "",
			lastName: isLoggedIn ? authenticatedUser?.lastName || "" : "",
		}),
		[
			authenticatedUser?.email,
			authenticatedUser?.firstName,
			authenticatedUser?.lastName,
			isLoggedIn,
			prefillPromoCode,
		],
	);

	return (
		<Formik<PaymentFormValues>
			enableReinitialize
			initialValues={initialValues}
			onSubmit={() => {}}
			validateOnMount
			validationSchema={paymentFormSchema}
		>
			{(props) => (
				<Form>
					<div className="grid gap-8 lg:grid-cols-2">
						<PaymentPlanSummary
							pricingOption={pricingOption}
							promoPriceRow={promoPriceRow}
						/>

						<div className="rounded-2xl border border-gray-200 bg-white p-6">
							<InputField
								name="firstName"
								onChangeCallback={
									formTouchedSinceLastSubmit
										? undefined
										: () => setFormTouchedSinceLastSubmit(true)
								}
								strLabel="First name"
							/>
							<InputField
								name="lastName"
								onChangeCallback={
									formTouchedSinceLastSubmit
										? undefined
										: () => setFormTouchedSinceLastSubmit(true)
								}
								strLabel="Last name"
							/>
							<InputField
								name="email"
								onChangeCallback={
									formTouchedSinceLastSubmit
										? undefined
										: () => setFormTouchedSinceLastSubmit(true)
								}
								strLabel="Email address"
							/>

							<div className="mt-4">
								<label
									className="mb-2 block text-sm font-medium text-gray-600"
									htmlFor="discountCode"
								>
									Discount or promo code (optional)
								</label>
								<div className="flex flex-col gap-3 sm:flex-row">
									<div className="min-w-0 flex-1">
										<InputField
											name="discountCode"
											onChangeCallback={() => {
												clearAppliedPromo();
												if (!formTouchedSinceLastSubmit) {
													setFormTouchedSinceLastSubmit(true);
												}
											}}
											placeHolder="Enter code"
											strLabel=""
										/>
									</div>
									<Button
										bLoading={isApplyingPromo}
										borderRadius="small"
										isDisabled={isApplyingPromo}
										onClick={() => handleApplyPromo(props.values.discountCode)}
										textTransform="none"
										type="button"
									>
										Apply
									</Button>
								</div>

								{appliedPromo ? (
									<div
										className="mt-3 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4"
										role="status"
									>
										<span
											className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100"
											aria-hidden
										>
											<Icon
												color="#047857"
												path={mdiCheckboxMarkedCircleOutline}
												size={1.1}
											/>
										</span>
										<div className="min-w-0 text-sm text-gray-700">
											<p className="font-bold text-green-900">Promo applied</p>
											{appliedPromo.code ? (
												<p className="mt-1 font-semibold uppercase tracking-wide text-green-800">
													{appliedPromo.code}
												</p>
											) : null}
											{promoOriginalListPence != null ? (
												<p className="mt-2">
													Original price:{" "}
													<span className="font-semibold text-gray-500 line-through">
														{priceConverter({
															currency: "£",
															price: promoOriginalListPence,
														})}
													</span>
												</p>
											) : null}
											{appliedPromo.discount_pence > 0 ? (
												<p className="mt-1">
													You save{" "}
													<span className="font-bold text-green-800">
														{priceConverter({
															currency: "£",
															price: appliedPromo.discount_pence,
														})}
														{promoPercentOff != null
															? ` (${promoPercentOff}% off)`
															: ""}
													</span>
												</p>
											) : null}
											<p className="mt-1">
												Total due:{" "}
												<span className="font-bold text-green-800">
													{priceConverter({
														currency: "£",
														price: chargeAmountPence,
													})}
												</span>
											</p>
										</div>
									</div>
								) : null}
							</div>

							{promoApplyError ? (
								<Text variant="error" className="mt-2">
									{promoApplyError}
								</Text>
							) : null}

							<div className="mt-6">
								<PaymentElement
									onChange={() => setErrorMessage(null)}
									options={{ layout: "accordion" }}
								/>
							</div>

							<div className="mt-6">
								<Button
									bLoading={isSubmitButtonLoading}
									isDisabled={
										!stripe || !elements || props.isSubmitting || !props.isValid
									}
									isFullWidth
									onClick={(event) => {
										void handleSubmit({ event, formValues: props.values });
									}}
									textTransform="none"
									type="button"
								>
									{`Pay ${priceConverter({
										currency: "£",
										price: chargeAmountPence,
									})} now`}
								</Button>
							</div>

							{errorMessage ? (
								<Text variant="error" className="mt-3">
									{errorMessage}
								</Text>
							) : null}
						</div>
					</div>
				</Form>
			)}
		</Formik>
	);
}
