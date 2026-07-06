"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import type { ApiOpportunity } from "@customTypes/opportunity";
import type { Tag as TagType } from "@customTypes/tag";
import { useAdminUser } from "@hooks/useAdminUsers";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { useMediaOutlet } from "@hooks/useMediaOutlets";
import {
	ADMIN_OPPORTUNITY_STATUS_SELECT_OPTIONS,
	type AdminOpportunityStatus,
	formatAdminOpportunityStatusLabel,
	getOpportunityApiErrorMessage,
	parseAdminOpportunityStatus,
	patchOpportunity,
	revalidateOpportunityDetailCaches,
	revalidateOpportunityLists,
	useAdminOpportunity,
} from "@hooks/useOpportunities";
import { usePublicUser } from "@hooks/usePublicUser";
import type { MultiValue, SingleValue } from "react-select";

import Button from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import Heading from "@/components/Heading";
import { OpportunityDetail } from "@/components/opportunity-detail";
import { EditOpportunityModal } from "@/components/pages/Opportunities/EditOpportunityModal";
import RichTextRenderer from "@/components/RichTextRenderer";
import Select, { type SelectOption } from "@/components/Select/Select";
import { SidebarLayout } from "@/components/Sidebar";
import Tag from "@/components/Tag";
import type { TagSkin } from "@/components/Tag/Tag";
import Text from "@/components/Text";
import { resolveBytescaleDisplayUrl } from "@/components/UploadButton";
import {
	applyCreatorToOpportunity,
	applyMediaOutletToOpportunity,
	mapApiOpportunityToDisplay,
	opportunityCreatorPk,
	opportunityCreatorUsername,
} from "@/lib/opportunities";
import { profilePagePath } from "@/lib/publicUser";
import { richTextDocFromApiField } from "@/lib/tiptap-utils";

type AdminOpportunityTab = "preview" | "creator";

const STATUS_TAG_SKINS: Record<AdminOpportunityStatus, TagSkin> = {
	submitted: "yellow",
	approved: "green",
	draft: "alt",
	declined: "red",
	archived: "blue",
};

function isMultiSelectValue(
	value: SingleValue<SelectOption> | MultiValue<SelectOption>,
): value is MultiValue<SelectOption> {
	return Array.isArray(value);
}

function AdminOpportunityStatusControl({
	opportunityPk,
	status,
}: {
	opportunityPk: number;
	status: string | null | undefined;
}) {
	const currentStatus = parseAdminOpportunityStatus(status);
	const [pendingStatus, setPendingStatus] =
		useState<AdminOpportunityStatus | null>(null);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	const selectedStatusOption = useMemo(() => {
		if (!currentStatus) {
			return undefined;
		}

		return (
			ADMIN_OPPORTUNITY_STATUS_SELECT_OPTIONS.find(
				(option) => option.value === currentStatus,
			) ?? undefined
		);
	}, [currentStatus]);

	const handleStatusChange = (
		value: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => {
		if (isMultiSelectValue(value)) {
			return;
		}

		const nextStatus = parseAdminOpportunityStatus(value?.value);
		if (!nextStatus || nextStatus === currentStatus) {
			return;
		}

		setPendingStatus(nextStatus);
		setIsConfirmOpen(true);
	};

	const handleCancel = () => {
		if (isUpdating) {
			return;
		}

		setIsConfirmOpen(false);
		setPendingStatus(null);
	};

	const handleConfirm = async () => {
		if (!pendingStatus) {
			return;
		}

		setIsUpdating(true);
		try {
			await patchOpportunity(opportunityPk, { status: pendingStatus });
			await revalidateOpportunityDetailCaches(opportunityPk);
			await revalidateOpportunityLists();
			toast.success(
				`Status updated to ${formatAdminOpportunityStatusLabel(pendingStatus)}.`,
			);
			setIsConfirmOpen(false);
			setPendingStatus(null);
		} catch (error) {
			toast.error(getOpportunityApiErrorMessage(error));
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<>
			<div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<Text variant="detail-label">Current status</Text>
						<div className="mt-2">
							{currentStatus ? (
								<Tag skin={STATUS_TAG_SKINS[currentStatus]}>
									{formatAdminOpportunityStatusLabel(currentStatus)}
								</Tag>
							) : (
								<Text variant="sm">Unknown</Text>
							)}
						</div>
					</div>

					<div className="w-full max-w-xs">
						<label
							className="mb-2 block text-sm font-medium text-gray-900"
							htmlFor="admin-opportunity-status-change"
						>
							Change status
						</label>
						<Select
							arrOptions={[...ADMIN_OPPORTUNITY_STATUS_SELECT_OPTIONS]}
							bCompact
							id="admin-opportunity-status-change"
							isDisabled={isUpdating || !currentStatus}
							isSearchable={false}
							onChange={handleStatusChange}
							placeholder="Select status"
							value={selectedStatusOption}
						/>
					</div>
				</div>
			</div>

			<ConfirmModal
				confirmLabel="Change status"
				isLoading={isUpdating}
				isOpen={isConfirmOpen}
				message={
					pendingStatus && currentStatus
						? `Change this opportunity from ${formatAdminOpportunityStatusLabel(currentStatus)} to ${formatAdminOpportunityStatusLabel(pendingStatus)}?`
						: "Change the status of this opportunity?"
				}
				onCancel={handleCancel}
				onConfirm={() => void handleConfirm()}
				title="Confirm status change"
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

function AdminOpportunityTabs({
	activeTab,
	onTabChange,
}: {
	activeTab: AdminOpportunityTab;
	onTabChange: (tab: AdminOpportunityTab) => void;
}) {
	const tabs: { id: AdminOpportunityTab; label: string }[] = [
		{ id: "preview", label: "Public view" },
		{ id: "creator", label: "Creator" },
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

function AdminOpportunityPreviewTab({ api }: { api: ApiOpportunity }) {
	const creatorUsername = opportunityCreatorUsername(api);
	const { data: creator, isLoading: isLoadingCreator } =
		usePublicUser(creatorUsername);

	const mediaOutletPk =
		api.media_outlet != null && api.media_outlet > 0 ? api.media_outlet : null;
	const { data: mediaOutlet, isLoading: isLoadingMediaOutlet } =
		useMediaOutlet(mediaOutletPk);

	const opportunity = useMemo(() => {
		const base = mapApiOpportunityToDisplay(api, mediaOutlet);
		const withPublication = mediaOutlet
			? applyMediaOutletToOpportunity(base, mediaOutlet)
			: base;

		if (creator) {
			return applyCreatorToOpportunity(withPublication, creator);
		}

		return withPublication;
	}, [api, creator, mediaOutlet]);

	if (
		(mediaOutletPk != null && isLoadingMediaOutlet) ||
		(creatorUsername != null && isLoadingCreator)
	) {
		return <Text variant="loading">Loading public preview…</Text>;
	}

	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-6">
			<OpportunityDetail
				opportunity={opportunity}
				showActions={false}
				variant="embedded"
			/>
		</div>
	);
}

function AdminOpportunityCreatorTab({
	creatorPk,
}: {
	creatorPk: number | null;
}) {
	const { data: user, error, isLoading } = useAdminUser(creatorPk);

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

	if (!creatorPk) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<Text variant="center-sm">
					No creator is associated with this opportunity.
				</Text>
			</div>
		);
	}

	if (isLoading && !user) {
		return <Text variant="loading">Loading creator…</Text>;
	}

	if (error) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<Text variant="error">
					{accessDenied
						? "Access denied. Sign in with a staff account to continue."
						: "Could not load the creator for this opportunity."}
				</Text>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<Text variant="center-sm">Creator not found.</Text>
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

export function AdminOpportunityDetail() {
	const router = useRouter();
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);
	const [activeTab, setActiveTab] = useState<AdminOpportunityTab>("preview");
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();
	const { data, error, isLoading } = useAdminOpportunity(
		Number.isFinite(pk) && pk > 0 ? pk : null,
	);

	const creatorPk = data ? opportunityCreatorPk(data) : null;

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
				<Text variant="center-sm">Invalid opportunity.</Text>
			</SidebarLayout>
		);
	}

	return (
		<SidebarLayout>
			<div className="mb-6">
				<Link
					href="/admin/opportunity"
					className="text-sm font-medium text-gray-600 hover:text-black"
				>
					← Back to opportunities
				</Link>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<Heading level={1} variant="page-lg">
						{data?.title?.trim() || "Opportunity"}
					</Heading>
					<Text variant="page-subtitle">
						Review how this opportunity appears publicly and who created it.
					</Text>
				</div>
				<Button
					onClick={() => setIsEditModalOpen(true)}
					textTransform="none"
					type="button"
				>
					Edit opportunity
				</Button>
			</div>

			<EditOpportunityModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				opportunityPk={pk}
			/>

			{data ? (
				<AdminOpportunityStatusControl
					opportunityPk={pk}
					status={data.status}
				/>
			) : null}

			<div className="mt-8">
				<AdminOpportunityTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>

				<div className="mt-6">
					{!authenticationChecked || (isLoading && !data) ? (
						<Text variant="loading">Loading opportunity…</Text>
					) : error || !data ? (
						<Text variant="error">
							Could not load this opportunity. It may not exist or you may not
							have permission to view it.
						</Text>
					) : activeTab === "preview" ? (
						<AdminOpportunityPreviewTab api={data} />
					) : (
						<AdminOpportunityCreatorTab creatorPk={creatorPk} />
					)}
				</div>
			</div>
		</SidebarLayout>
	);
}
