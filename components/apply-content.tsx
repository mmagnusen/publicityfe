"use client";

import { useState } from "react";
import axios from "axios";
import { Form, Formik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";

import type { RichTextContent } from "@customTypes/index";
import { RichTextDefaultValues } from "@customTypes/index";
import { useOpportunity } from "@hooks/useOpportunities";
import { usePublicUser } from "@hooks/usePublicUser";

import Button from "@/components/Button";
import TipTapEditorField from "@/components/FormikFields/TipTapEditorField";
import Heading from "@/components/Heading";
import { HistoryBackLink } from "@/components/history-back-link";
import Text from "@/components/Text";
import { resolveBytescaleDisplayUrl } from "@/components/UploadButton";
import { submitApplication } from "@/lib/applications";
import { opportunityCreatorUsername } from "@/lib/opportunities";

type FormValues = {
	message: RichTextContent;
};

const initialValues: FormValues = {
	message: RichTextDefaultValues,
};

const validationSchema = Yup.object().shape({
	message: Yup.object().test(
		"has-content",
		"A message is required",
		(value) => {
			const content = value as RichTextContent | undefined;
			return (content?.characterCount ?? 0) > 0;
		},
	),
});

export function ApplyContent() {
	const params = useParams<{ pk: string }>();
	const router = useRouter();
	const pk = Number(params.pk);
	const [submitted, setSubmitted] = useState(false);

	const { data, error, isLoading } = useOpportunity(
		Number.isFinite(pk) && pk > 0 ? pk : null,
	);

	const creatorUsername = data ? opportunityCreatorUsername(data) : null;
	const { data: creator, isLoading: isLoadingCreator } =
		usePublicUser(creatorUsername);

	if (!Number.isFinite(pk) || pk <= 0) {
		return (
			<div className="flex min-h-full items-center justify-center bg-white px-6 py-16">
				<Text variant="center-sm">Invalid opportunity.</Text>
			</div>
		);
	}

	if (isLoading || (creatorUsername != null && isLoadingCreator)) {
		return (
			<div className="flex min-h-full items-center justify-center bg-white px-6 py-16">
				<Text variant="loading">Loading…</Text>
			</div>
		);
	}

	if (error || !data) {
		const notFound =
			axios.isAxiosError(error) && error.response?.status === 404;

		return (
			<div className="flex min-h-full items-center justify-center bg-white px-6 py-16">
				<Text variant="center-sm">
					{notFound
						? "Opportunity not found."
						: "Something went wrong. Please try again."}
				</Text>
			</div>
		);
	}

	const handleSubmit = async (values: FormValues) => {
		try {
			await submitApplication({
				message: values.message.editorHTML,
				opportunityId: pk,
			});

			setSubmitted(true);
			toast.success("Application submitted successfully.");
		} catch (submitError: unknown) {
			const fallback = "Something went wrong. Please try again.";

			if (axios.isAxiosError(submitError)) {
				const detail = submitError.response?.data?.detail;
				toast.error(typeof detail === "string" ? detail : fallback);
			} else {
				toast.error(fallback);
			}
		}
	};

	return (
		<div className="min-h-full bg-white">
			<header className="border-b border-gray-200 px-6 py-4">
				<div className="mx-auto max-w-2xl">
					<HistoryBackLink
						className="text-sm font-medium text-gray-500 transition-colors hover:text-black"
						fallbackHref={`/opportunity/${pk}`}
					>
						← Back to opportunity
					</HistoryBackLink>
				</div>
			</header>

			<main className="mx-auto max-w-2xl px-6 py-10">
				<Heading level={1} variant="page-detail">
					Apply: {data.title}
				</Heading>

				<Text variant="section-lead-relaxed" className="mt-2">
					Send a message to {creator?.first_name ?? "the reporter"} explaining
					why you&apos;re a great fit for this opportunity.
				</Text>

				{creator ? (
					<div className="mt-6 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
						{resolveBytescaleDisplayUrl(
							creator.human_profile.profile_image_url,
						) ? (
							// Profile images come from Bytescale CDN URLs— not in next/image config.
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={
									resolveBytescaleDisplayUrl(
										creator.human_profile.profile_image_url,
									)!
								}
								alt={`${creator.first_name} ${creator.last_name}`}
								className="size-12 shrink-0 rounded-full object-cover"
							/>
						) : (
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">
								{creator.first_name.charAt(0)}
								{creator.last_name.charAt(0)}
							</div>
						)}
						<div>
							<p className="text-sm font-semibold text-gray-900">
								{creator.first_name} {creator.last_name}
							</p>
							{creator.human_profile.tagline ? (
								<p className="text-sm text-gray-500">
									{creator.human_profile.tagline}
								</p>
							) : null}
						</div>
					</div>
				) : null}

				{submitted ? (
					<div className="mt-8 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
						Your application has been submitted. The reporter will be in touch
						if they&apos;d like to move forward.
					</div>
				) : (
					<Formik
						initialValues={initialValues}
						onSubmit={handleSubmit}
						validationSchema={validationSchema}
					>
						{(props) => (
							<Form className="mt-8 space-y-1">
								<TipTapEditorField
									existingContent={props.values.message.editorJSON}
									name="message"
									renderToolbar
									strLabel="Your message"
								/>

								<div className="flex gap-3 pt-4">
									<Button
										bLoading={props.isSubmitting}
										isDisabled={props.isSubmitting || !props.isValid}
										textTransform="none"
										type="submit"
									>
										Submit application
									</Button>
									<Button
										strVariant="transparentWithBorder"
										textTransform="none"
										type="button"
										onClick={() => router.back()}
									>
										Cancel
									</Button>
								</div>
							</Form>
						)}
					</Formik>
				)}
			</main>
		</div>
	);
}
