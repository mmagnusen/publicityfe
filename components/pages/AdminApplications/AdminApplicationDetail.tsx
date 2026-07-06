"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import type { Tag as TagType } from "@customTypes/tag";
import {
	type AdminApplication,
	formatAdminApplicationApprovalStatusLabel,
	getAdminApplicationApiErrorMessage,
	parseAdminApplicationApprovalStatus,
	patchAdminApplication,
	revalidateAdminApplicationCaches,
	useAdminApplication,
} from "@hooks/useAdminApplications";
import { buildAdminUsersPageHref, useAdminUser } from "@hooks/useAdminUsers";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { useMediaOutlet } from "@hooks/useMediaOutlets";
import { useAdminOpportunity } from "@hooks/useOpportunities";
import { usePublicUser } from "@hooks/usePublicUser";

import Button from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import Heading from "@/components/Heading";
import { OpportunityDetail } from "@/components/opportunity-detail";
import RichTextRenderer from "@/components/RichTextRenderer";
import { SidebarLayout } from "@/components/Sidebar";
import Tag from "@/components/Tag";
import type { TagSkin } from "@/components/Tag/Tag";
import Text from "@/components/Text";
import { resolveBytescaleDisplayUrl } from "@/components/UploadButton";
import { applicationApplicantPk } from "@/lib/adminApplications";
import {
	applyCreatorToOpportunity,
	applyMediaOutletToOpportunity,
	mapApiOpportunityToDisplay,
	opportunityCreatorUsername,
} from "@/lib/opportunities";
import { profilePagePath } from "@/lib/publicUser";
import { richTextDocFromApiField } from "@/lib/tiptap-utils";

type AdminApplicationTab = "application" | "opportunity" | "applicant";

const APPROVAL_STATUS_TAG_SKINS: Record<"submitted" | "approved", TagSkin> = {
	submitted: "yellow",
	approved: "green",
};

function AdminApplicationApprovalControl({
	applicationPk,
	approvalStatus,
}: {
	applicationPk: number;
	approvalStatus: string | null | undefined;
}) {
	const currentStatus = parseAdminApplicationApprovalStatus(approvalStatus);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isApproving, setIsApproving] = useState(false);

	const handleCancel = () => {
		if (isApproving) {
			return;
		}

		setIsConfirmOpen(false);
	};

	const handleConfirm = async () => {
		setIsApproving(true);
		try {
			await patchAdminApplication(applicationPk, {
				approval_status: "approved",
			});
			await revalidateAdminApplicationCaches(applicationPk);
			toast.success("Application approved.");
			setIsConfirmOpen(false);
		} catch (error) {
			toast.error(getAdminApplicationApiErrorMessage(error));
		} finally {
			setIsApproving(false);
		}
	};

	return (
		<>
			<div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Text variant="detail-label">Application status</Text>
						<div className="mt-2">
							{currentStatus ? (
								<Tag skin={APPROVAL_STATUS_TAG_SKINS[currentStatus]}>
									{formatAdminApplicationApprovalStatusLabel(currentStatus)}
								</Tag>
							) : (
								<Text variant="sm">Unknown</Text>
							)}
						</div>
					</div>

					{currentStatus === "submitted" ? (
						<Button
							isDisabled={isApproving}
							onClick={() => setIsConfirmOpen(true)}
							textTransform="none"
							type="button"
						>
							Approve
						</Button>
					) : null}
				</div>
			</div>

			<ConfirmModal
				confirmLabel="Approve"
				isLoading={isApproving}
				isOpen={isConfirmOpen}
				message="Approve this application? The applicant will be marked as approved."
				onCancel={handleCancel}
				onConfirm={() => void handleConfirm()}
				title="Confirm approval"
			/>
		</>
	);
}

function formatDateTime(value: string | undefined) {
	if (!value) {
		return "—";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "—";
	}

	return date.toLocaleString(undefined, {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function DetailRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
			<dt className="text-sm font-medium text-gray-500">{label}</dt>
			<dd className="text-sm text-gray-900">{children}</dd>
		</div>
	);
}

function ExternalLink({ href }: { href: string }) {
	return (
		<a
			className="break-all text-violet-700 underline-offset-2 hover:underline"
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			{href}
		</a>
	);
}

function YesNoTag({ value }: { value: boolean }) {
	return <Tag skin={value ? "green" : "red"}>{value ? "Yes" : "No"}</Tag>;
}

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl: string }) {
	if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={avatarUrl}
				alt={name}
				className="size-20 rounded-full border border-gray-200 object-cover"
			/>
		);
	}

	return (
		<div className="relative size-20 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
			<Image
				src={avatarUrl}
				alt={name}
				fill
				sizes="80px"
				className="object-cover"
			/>
		</div>
	);
}

function AdminApplicationTabs({
	activeTab,
	onTabChange,
}: {
	activeTab: AdminApplicationTab;
	onTabChange: (tab: AdminApplicationTab) => void;
}) {
	const tabs: { id: AdminApplicationTab; label: string }[] = [
		{ id: "application", label: "Application" },
		{ id: "opportunity", label: "Opportunity" },
		{ id: "applicant", label: "Applicant" },
	];

	return (
		<div className="border-b border-gray-200">
			<div className="flex gap-6">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;

					return (
						<button
							key={tab.id}
							type="button"
							className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
								isActive
									? "border-black text-black"
									: "border-transparent text-gray-500 hover:text-black"
							}`}
							onClick={() => onTabChange(tab.id)}
						>
							{tab.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function applicantDisplayName(application: AdminApplication) {
	return (
		`${application.applicant_first_name} ${application.applicant_last_name}`.trim() ||
		application.applicant_username ||
		"Applicant"
	);
}

function AdminApplicationDetailsTab({
	application,
}: {
	application: AdminApplication;
}) {
	const approvalStatus = parseAdminApplicationApprovalStatus(
		application.approval_status,
	);

	return (
		<div className="space-y-6">
			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<Heading level={2} variant="subsection">
					Submission details
				</Heading>
				<dl className="mt-4 grid gap-4">
					<DetailRow label="Application ID">{application.pk}</DetailRow>
					<DetailRow label="Submitted">
						{formatDateTime(application.created_at)}
					</DetailRow>
					<DetailRow label="Status">
						{approvalStatus ? (
							<Tag skin={APPROVAL_STATUS_TAG_SKINS[approvalStatus]}>
								{formatAdminApplicationApprovalStatusLabel(approvalStatus)}
							</Tag>
						) : (
							"—"
						)}
					</DetailRow>
					<DetailRow label="Opportunity">
						<Link
							className="font-medium text-violet-700 underline-offset-2 hover:underline"
							href={`/admin/opportunity/${application.opportunity_id}`}
						>
							{application.opportunity_title}
						</Link>
					</DetailRow>
					<DetailRow label="Applicant">
						{applicantDisplayName(application)}
						{application.applicant_username ? (
							<span className="text-gray-500">
								{" "}
								(@{application.applicant_username})
							</span>
						) : null}
					</DetailRow>
				</dl>
			</section>

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<Heading level={2} variant="subsection">
					Message
				</Heading>
				{application.message ? (
					<div
						className="mt-4 text-sm leading-relaxed text-gray-700 [&_p]:mb-2"
						dangerouslySetInnerHTML={{ __html: application.message }}
					/>
				) : (
					<Text variant="center-sm" className="mt-4">
						No message was included with this application.
					</Text>
				)}
			</section>
		</div>
	);
}

function AdminApplicationOpportunityTab({
	opportunityId,
}: {
	opportunityId: number;
}) {
	const { data: api, error, isLoading } = useAdminOpportunity(opportunityId);

	const creatorUsername = api ? opportunityCreatorUsername(api) : null;
	const { data: creator, isLoading: isLoadingCreator } =
		usePublicUser(creatorUsername);

	const mediaOutletPk =
		api?.media_outlet != null && api.media_outlet > 0 ? api.media_outlet : null;
	const { data: mediaOutlet, isLoading: isLoadingMediaOutlet } =
		useMediaOutlet(mediaOutletPk);

	const opportunity = useMemo(() => {
		if (!api) {
			return null;
		}

		const base = mapApiOpportunityToDisplay(api, mediaOutlet);
		const withPublication = mediaOutlet
			? applyMediaOutletToOpportunity(base, mediaOutlet)
			: base;

		if (creator) {
			return applyCreatorToOpportunity(withPublication, creator);
		}

		return withPublication;
	}, [api, creator, mediaOutlet]);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	if (isLoading && !api) {
		return <Text variant="loading">Loading opportunity…</Text>;
	}

	if (error || !api || !opportunity) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<Text variant="error">
					{accessDenied
						? "Access denied. Sign in with a staff account to continue."
						: "Could not load the opportunity for this application."}
				</Text>
			</div>
		);
	}

	if (
		(mediaOutletPk != null && isLoadingMediaOutlet) ||
		(creatorUsername != null && isLoadingCreator)
	) {
		return <Text variant="loading">Loading opportunity preview…</Text>;
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Button
					href={`/admin/opportunity/${opportunityId}`}
					strVariant="transparentWithBorder"
					textTransform="none"
				>
					Open in opportunities admin
				</Button>
			</div>
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<OpportunityDetail
					opportunity={opportunity}
					showActions={false}
					variant="embedded"
				/>
			</div>
		</div>
	);
}

function AdminApplicationApplicantTab({
	application,
}: {
	application: AdminApplication;
}) {
	const applicantPk = applicationApplicantPk(application);
	const { data: user, error, isLoading } = useAdminUser(applicantPk);

	const bioRichText = useMemo(
		() => richTextDocFromApiField(user?.human_profile?.bio),
		[user?.human_profile?.bio],
	);
	const shortDescriptionRichText = useMemo(
		() => richTextDocFromApiField(user?.human_profile?.short_description),
		[user?.human_profile?.short_description],
	);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	const fallbackName = applicantDisplayName(application);
	const username = application.applicant_username?.trim() || "";

	if (!applicantPk) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<Heading level={2} variant="subsection">
					{fallbackName}
				</Heading>
				{username ? (
					<Text variant="page-subtitle" className="mt-1">
						@{username}
					</Text>
				) : null}
				<div className="mt-6 flex flex-wrap gap-3">
					{username ? (
						<>
							<Button
								href={profilePagePath(username)}
								strVariant="transparentWithBorder"
								textTransform="none"
							>
								View public profile
							</Button>
							<Button
								href={buildAdminUsersPageHref(1, username)}
								strVariant="transparentWithBorder"
								textTransform="none"
							>
								Search in users admin
							</Button>
						</>
					) : null}
				</div>
			</div>
		);
	}

	if (isLoading && !user) {
		return <Text variant="loading">Loading applicant…</Text>;
	}

	if (error) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<Text variant="error">
					{accessDenied
						? "Access denied. Sign in with a staff account to continue."
						: "Could not load the applicant for this application."}
				</Text>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<Text variant="center-sm">Applicant not found.</Text>
			</div>
		);
	}

	const displayName =
		`${user.first_name} ${user.last_name}`.trim() || user.username;
	const avatarUrl =
		resolveBytescaleDisplayUrl(user.human_profile?.profile_image_url) ||
		"/opportunity/reporter.jpg";
	const headline =
		user.human_profile?.tagline?.trim() ||
		user.human_profile?.headline?.trim() ||
		"";
	const isActive = user.is_active !== false;

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<UserAvatar avatarUrl={avatarUrl} name={displayName} />
						<div>
							<Heading level={2} variant="subsection">
								{displayName}
							</Heading>
							<Text variant="page-subtitle">@{user.username}</Text>
						</div>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button
							href={profilePagePath(user.username)}
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							View public profile
						</Button>
						<Button
							href={`/admin/users/${user.pk}`}
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							Open in users admin
						</Button>
					</div>
				</div>
			</div>

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<Heading level={2} variant="subsection">
					Account
				</Heading>
				<dl className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-x-8">
					<DetailRow label="User ID">{user.pk}</DetailRow>
					<DetailRow label="First name">{user.first_name || "—"}</DetailRow>
					<DetailRow label="Last name">{user.last_name || "—"}</DetailRow>
					<DetailRow label="Username">{user.username}</DetailRow>
					<DetailRow label="Email">{user.email}</DetailRow>
					<DetailRow label="Registration method">
						{user.registration_method || "—"}
					</DetailRow>
					<DetailRow label="Date joined">
						{formatDateTime(user.date_joined)}
					</DetailRow>
					<DetailRow label="Email verified">
						<YesNoTag value={user.email_verified} />
					</DetailRow>
					<DetailRow label="Identity verified">
						<YesNoTag value={Boolean(user.identity_verified)} />
					</DetailRow>
					<DetailRow label="Active account">
						<YesNoTag value={isActive} />
					</DetailRow>
					<DetailRow label="Staff">
						<YesNoTag value={Boolean(user.is_staff)} />
					</DetailRow>
					<DetailRow label="Superuser">
						<YesNoTag value={Boolean(user.is_superuser)} />
					</DetailRow>
					<DetailRow label="Premium subscription">
						<YesNoTag value={Boolean(user.has_active_subscription)} />
					</DetailRow>
				</dl>
			</section>

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<Heading level={2} variant="subsection">
					Profile
				</Heading>
				<dl className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-x-8">
					<DetailRow label="Headline">{headline || "—"}</DetailRow>
					<DetailRow label="City">
						{user.human_profile?.city?.trim() || "—"}
					</DetailRow>
					<DetailRow label="Timezone">
						{user.human_profile?.timezone?.trim() || "—"}
					</DetailRow>
					<DetailRow label="Website">
						{user.human_profile?.personal_website_url?.trim() ? (
							<ExternalLink
								href={user.human_profile.personal_website_url.trim()}
							/>
						) : (
							"—"
						)}
					</DetailRow>
					<DetailRow label="LinkedIn">
						{user.human_profile?.linked_in_url?.trim() ? (
							<ExternalLink href={user.human_profile.linked_in_url.trim()} />
						) : (
							"—"
						)}
					</DetailRow>
					<DetailRow label="Instagram">
						{user.human_profile?.instagram_url?.trim() ? (
							<ExternalLink href={user.human_profile.instagram_url.trim()} />
						) : (
							"—"
						)}
					</DetailRow>
					<DetailRow label="Facebook">
						{user.human_profile?.facebook_url?.trim() ? (
							<ExternalLink href={user.human_profile.facebook_url.trim()} />
						) : (
							"—"
						)}
					</DetailRow>
				</dl>

				{user.tags && user.tags.length > 0 ? (
					<div className="mt-6">
						<Text variant="detail-label">Tags</Text>
						<ul className="mt-2 flex flex-wrap gap-2">
							{user.tags.map((tag: TagType) => (
								<li key={tag.pk}>
									<Tag skin="alt">{tag.name}</Tag>
								</li>
							))}
						</ul>
					</div>
				) : null}

				{shortDescriptionRichText ? (
					<div className="mt-6">
						<Text variant="detail-label">Short description</Text>
						<RichTextRenderer
							className="mt-2"
							richText={shortDescriptionRichText}
						/>
					</div>
				) : null}

				{bioRichText ? (
					<div className="mt-6">
						<Text variant="detail-label">Bio</Text>
						<RichTextRenderer className="mt-2" richText={bioRichText} />
					</div>
				) : null}
			</section>
		</div>
	);
}

export function AdminApplicationDetail() {
	const router = useRouter();
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);
	const [activeTab, setActiveTab] =
		useState<AdminApplicationTab>("application");

	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useAdminApplication(
		Number.isFinite(pk) && pk > 0 ? pk : null,
	);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	useEffect(() => {
		if (authenticationChecked && !isLoggedIn) {
			router.replace("/login");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	if (authenticationChecked && !isLoggedIn) {
		return null;
	}

	if (authenticationChecked && isLoggedIn && !isAdmin) {
		return (
			<SidebarLayout>
				<Text variant="center-sm">
					You don&apos;t have permission to view this page.
				</Text>
			</SidebarLayout>
		);
	}

	if (!Number.isFinite(pk) || pk <= 0) {
		return (
			<SidebarLayout>
				<Text variant="center-sm">Invalid application.</Text>
			</SidebarLayout>
		);
	}

	const pageTitle = data
		? `${applicantDisplayName(data)} → ${data.opportunity_title}`
		: "Application";

	return (
		<SidebarLayout>
			<div className="mb-6">
				<Link
					href="/admin/applications"
					className="text-sm font-medium text-gray-600 hover:text-black"
				>
					← Back to applications
				</Link>
			</div>

			<Heading level={1} variant="page-lg">
				{pageTitle}
			</Heading>
			<Text variant="page-subtitle">
				Review the application, related opportunity, and applicant details.
			</Text>

			{data ? (
				<AdminApplicationApprovalControl
					applicationPk={pk}
					approvalStatus={data.approval_status}
				/>
			) : null}

			<div className="mt-8">
				<AdminApplicationTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>

				<div className="mt-6">
					{!authenticationChecked || (isLoading && !data) ? (
						<Text variant="loading">Loading application…</Text>
					) : error || !data ? (
						<Text variant="error">
							{accessDenied
								? "Access denied. Sign in with a staff account to continue."
								: "Could not load this application. It may not exist or you may not have permission to view it."}
						</Text>
					) : activeTab === "application" ? (
						<AdminApplicationDetailsTab application={data} />
					) : activeTab === "opportunity" ? (
						<AdminApplicationOpportunityTab
							opportunityId={data.opportunity_id}
						/>
					) : (
						<AdminApplicationApplicantTab application={data} />
					)}
				</div>
			</div>
		</SidebarLayout>
	);
}
