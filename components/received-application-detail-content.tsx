"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { mutate } from "swr";
import {
	mdiAccountOutline,
	mdiEmailCheckOutline,
	mdiEmailOutline,
	mdiInstagram,
	mdiLinkedin,
	mdiMapMarkerOutline,
	mdiNewspaperVariantOutline,
	mdiWeb,
} from "@mdi/js";
import Icon from "@mdi/react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { useOpportunity } from "@hooks/useOpportunities";
import { usePublicUser } from "@hooks/usePublicUser";
import {
	formatOpportunityDeadlineLabel,
	formatReceivedApplicationAppliedAt,
	formatReceivedApplicationStatusLabel,
	getReceivedApplicationApiErrorMessage,
	parseReceivedApplicationDisplayStatus,
	patchReceivedApplication,
	type ReceivedApplication,
	receivedApplicantAvatarPalette,
	receivedApplicantDisplayName,
	receivedApplicantInitials,
	receivedApplicationFeaturedPublications,
	receivedApplicationStatusBadgeClassName,
	useReceivedApplication,
} from "@hooks/useReceivedApplications";

import Button from "@/components/Button";
import { ContactEmailModal } from "@/components/contact-email-modal";
import { HistoryBackLink } from "@/components/history-back-link";
import { SidebarLayout } from "@/components/Sidebar";
import Text from "@/components/Text";
import { resolveBytescaleDisplayUrl } from "@/components/UploadButton";
import { opportunityTypeLabel } from "@/constants/opportunityTypes";
import { cn } from "@/lib/cn";
import { profileLinksFromPublicUser } from "@/lib/profileForm";
import type { ProfileLink } from "@/lib/profiles";
import { profilePagePath } from "@/lib/publicUser";
import { RECEIVED_APPLICATIONS_PATH } from "@/lib/receivedApplications";
import { tipTapApiValueToPlainText } from "@/lib/tiptap-utils";

function DetailSection({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<section className="border-t border-gray-200 px-6 py-5">
			<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
				{label}
			</p>
			<div className="mt-3">{children}</div>
		</section>
	);
}

function AboutThemItem({ icon, text }: { icon: string; text: string }) {
	return (
		<div className="flex items-start gap-3 text-sm text-gray-700">
			<span className="inline-flex shrink-0 pt-0.5 text-gray-400" aria-hidden>
				<Icon horizontal path={icon} rotate={180} size={0.75} vertical />
			</span>
			<span>{text}</span>
		</div>
	);
}

function ProfileLinkIcon({ type }: { type: ProfileLink["type"] }) {
	const iconPath =
		type === "linkedin"
			? mdiLinkedin
			: type === "instagram"
				? mdiInstagram
				: mdiWeb;

	return (
		<span className="inline-flex shrink-0 text-violet-700" aria-hidden>
			<Icon horizontal path={iconPath} rotate={180} size={0.75} vertical />
		</span>
	);
}

function ApplicationDetailCard({
	application,
}: {
	application: ReceivedApplication;
}) {
	const applicantUsername = application.applicant_username?.trim() || null;
	const { data: applicant } = usePublicUser(applicantUsername);
	const { data: opportunity } = useOpportunity(application.opportunity_id);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isContactModalOpen, setIsContactModalOpen] = useState(false);

	const name = receivedApplicantDisplayName(application);
	const applicantEmail = application.applicant_email?.trim() || null;
	const initials = receivedApplicantInitials(application);
	const palette = receivedApplicantAvatarPalette(
		applicantUsername ?? String(application.pk),
	);
	const status = parseReceivedApplicationDisplayStatus(application);
	const headline =
		applicant?.human_profile?.tagline?.trim() ||
		applicant?.human_profile?.headline?.trim() ||
		application.applicant_headline?.trim() ||
		null;
	const profileHref = applicantUsername
		? profilePagePath(applicantUsername)
		: null;
	const avatarUrl = resolveBytescaleDisplayUrl(
		applicant?.human_profile?.profile_image_url,
	);
	const tagNames = (applicant?.tags ?? [])
		.map((tag) => tag.name?.trim())
		.filter(Boolean);
	const profileLinks = applicant ? profileLinksFromPublicUser(applicant) : [];
	const featuredLine = receivedApplicationFeaturedPublications(
		applicant?.profile_links,
	);
	const city =
		applicant?.human_profile?.city?.trim() ||
		application.applicant_city?.trim() ||
		null;
	const shortBio =
		tipTapApiValueToPlainText(
			applicant?.human_profile?.short_description,
		).trim() || tipTapApiValueToPlainText(applicant?.human_profile?.bio).trim();
	const opportunityTitle =
		application.opportunity_title?.trim() ||
		opportunity?.title?.trim() ||
		"Opportunity";
	const mediaOutlet =
		application.opportunity_media_outlet_name?.trim() ||
		opportunity?.media_outlet_name?.trim() ||
		null;
	const opportunityType = opportunityTypeLabel(
		application.opportunity_type?.trim() || opportunity?.type,
	);
	const deadline = formatOpportunityDeadlineLabel(
		application.opportunity_application_deadline ??
			opportunity?.application_deadline,
	);
	const opportunityMeta = [
		mediaOutlet,
		opportunityType,
		deadline ? `Deadline ${deadline}` : null,
	]
		.filter(Boolean)
		.join(" · ");

	const refreshApplication = async () => {
		await mutate(["received-application", application.pk]);
		await mutate(
			(key) =>
				typeof key === "string" && key.startsWith(RECEIVED_APPLICATIONS_PATH),
		);
	};

	const updateContactedStatus = async (contacted: boolean) => {
		setIsUpdating(true);
		try {
			await patchReceivedApplication(application.pk, { contacted });
			await refreshApplication();
			toast.success(
				contacted
					? "Application marked as contacted."
					: "Application unmarked as contacted.",
			);
		} catch (error) {
			toast.error(getReceivedApplicationApiErrorMessage(error));
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<>
			<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
				<div className="px-6 py-5">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex min-w-0 gap-4">
							{avatarUrl ? (
								// Profile images come from Bytescale CDN URLs.
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={avatarUrl}
									alt={name}
									className="size-14 shrink-0 rounded-full object-cover"
								/>
							) : (
								<span
									className={cn(
										"inline-flex size-14 shrink-0 items-center justify-center rounded-full text-base font-semibold",
										palette.bg,
										palette.text,
									)}
									aria-hidden
								>
									{initials}
								</span>
							)}

							<div className="min-w-0">
								<h1 className="text-lg font-semibold text-black">{name}</h1>
								{headline ? (
									<p className="mt-1 text-sm text-gray-500">{headline}</p>
								) : null}
								{shortBio ? (
									<p className="mt-2 text-sm leading-relaxed text-gray-600">
										{shortBio}
									</p>
								) : null}
								{tagNames.length > 0 ? (
									<div className="mt-3 flex flex-wrap gap-2">
										{tagNames.map((tag) => (
											<span
												key={tag}
												className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
											>
												{tag}
											</span>
										))}
									</div>
								) : null}
							</div>
						</div>

						<div className="shrink-0 text-right">
							<span
								className={cn(
									"inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
									receivedApplicationStatusBadgeClassName(status),
								)}
							>
								{formatReceivedApplicationStatusLabel(status)}
							</span>
							<p className="mt-2 text-xs text-gray-400">
								{formatReceivedApplicationAppliedAt(application.created_at)}
							</p>
						</div>
					</div>
				</div>

				<DetailSection label="Applying for">
					<p className="text-sm font-semibold text-gray-900">
						{opportunityTitle}
					</p>
					{opportunityMeta ? (
						<p className="mt-1 text-sm text-gray-500">{opportunityMeta}</p>
					) : null}
				</DetailSection>

				<DetailSection label="Their pitch">
					{application.message?.trim() ? (
						<div
							className="text-sm leading-relaxed text-gray-700 [&_p]:mb-3 [&_p:last-child]:mb-0"
							dangerouslySetInnerHTML={{ __html: application.message }}
						/>
					) : (
						<Text variant="sm" className="text-gray-500">
							No pitch message was included.
						</Text>
					)}
				</DetailSection>

				{(city || featuredLine) && (
					<DetailSection label="About them">
						<div className="space-y-3">
							{city ? (
								<AboutThemItem icon={mdiMapMarkerOutline} text={city} />
							) : null}
							{featuredLine ? (
								<AboutThemItem
									icon={mdiNewspaperVariantOutline}
									text={featuredLine}
								/>
							) : null}
						</div>
					</DetailSection>
				)}

				{profileLinks.length > 0 ? (
					<DetailSection label="Links">
						<ul className="flex flex-wrap gap-x-5 gap-y-2 list-none">
							{profileLinks.map((link) => (
								<li key={link.href}>
									<a
										className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-800"
										href={link.href}
										rel="noopener noreferrer"
										target="_blank"
									>
										<ProfileLinkIcon type={link.type} />
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</DetailSection>
				) : null}

				<div className="flex flex-wrap gap-3 border-t border-gray-200 px-6 py-5">
					<Button
						isDisabled={isUpdating}
						onClick={() => void updateContactedStatus(!application.contacted)}
						strVariant="transparentWithBorder"
						textTransform="none"
						type="button"
					>
						<span className="inline-flex items-center gap-2">
							<Icon
								horizontal
								path={mdiEmailCheckOutline}
								rotate={180}
								size={0.75}
								vertical
							/>
							{application.contacted
								? "Unmark as contacted"
								: "Mark as contacted"}
						</span>
					</Button>
					<Button
						onClick={() => setIsContactModalOpen(true)}
						strVariant="transparentWithBorder"
						textTransform="none"
						type="button"
					>
						<span className="inline-flex items-center gap-2">
							<Icon
								horizontal
								path={mdiEmailOutline}
								rotate={180}
								size={0.75}
								vertical
							/>
							Contact applicant
						</span>
					</Button>
					{profileHref ? (
						<Button
							href={profileHref}
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							<span className="inline-flex items-center gap-2">
								<Icon
									horizontal
									path={mdiAccountOutline}
									rotate={180}
									size={0.75}
									vertical
								/>
								View full profile
							</span>
						</Button>
					) : null}
				</div>
			</div>

			<ContactEmailModal
				contactName={name}
				description={`Email ${name} using the address below.`}
				email={applicantEmail}
				isOpen={isContactModalOpen}
				onClose={() => setIsContactModalOpen(false)}
				title="Contact applicant"
				unavailableMessage="Email address is not available for this applicant."
			/>
		</>
	);
}

export function ReceivedApplicationDetailContent() {
	const router = useRouter();
	const params = useParams();
	const { authenticationChecked, isLoggedIn } = useAuthenticatedUser();
	const applicationPk = useMemo(() => {
		const raw = params?.pk;
		const value = Array.isArray(raw) ? raw[0] : raw;
		const parsed = Number(value);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
	}, [params?.pk]);

	const { data, error, isLoading } = useReceivedApplication(applicationPk);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	if (!authenticationChecked) {
		return (
			<div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-16">
				<Text variant="loading">Loading application…</Text>
			</div>
		);
	}

	if (!isLoggedIn) {
		return null;
	}

	return (
		<SidebarLayout>
			<HistoryBackLink
				className="text-sm font-medium text-violet-700 hover:text-violet-800"
				fallbackHref="/applications-received"
			>
				← Back to applications received
			</HistoryBackLink>

			<div className="mt-6">
				{isLoading && !data ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="loading">Loading application…</Text>
					</div>
				) : error || !data ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="error">
							{accessDenied
								? "You do not have permission to view this application."
								: getReceivedApplicationApiErrorMessage(
										error ?? new Error("Application not found."),
									)}
						</Text>
						<div className="mt-4">
							<Button href="/applications-received" textTransform="none">
								Back to applications received
							</Button>
						</div>
					</div>
				) : (
					<ApplicationDetailCard application={data} />
				)}
			</div>
		</SidebarLayout>
	);
}
