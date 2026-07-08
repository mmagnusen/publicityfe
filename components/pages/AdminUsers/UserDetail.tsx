"use client";

import { useEffect, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import type { Tag as TagType } from "@customTypes/tag";
import { useAdminUser } from "@hooks/useAdminUsers";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import RichTextRenderer from "@/components/RichTextRenderer";
import { SidebarLayout } from "@/components/Sidebar";
import Tag from "@/components/Tag";
import Text from "@/components/Text";
import { resolveBytescaleDisplayUrl } from "@/components/UploadButton";
import { profilePagePath } from "@/lib/publicUser";
import { richTextDocFromApiField } from "@/lib/tiptap-utils";

function formatDateTime(value: string | undefined) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
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

export function UserDetail() {
	const router = useRouter();
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();

	const {
		data: user,
		error,
		isLoading,
	} = useAdminUser(Number.isFinite(pk) && pk > 0 ? pk : null);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	const bioRichText = useMemo(
		() => richTextDocFromApiField(user?.human_profile?.bio),
		[user?.human_profile?.bio],
	);
	const shortDescriptionRichText = useMemo(
		() => richTextDocFromApiField(user?.human_profile?.short_description),
		[user?.human_profile?.short_description],
	);

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
				<Text variant="center-sm">Invalid user.</Text>
			</SidebarLayout>
		);
	}

	const displayName =
		user && `${user.first_name} ${user.last_name}`.trim()
			? `${user.first_name} ${user.last_name}`.trim()
			: (user?.username ?? "User");
	const avatarUrl =
		resolveBytescaleDisplayUrl(user?.human_profile?.profile_image_url) ||
		"/opportunity/reporter.jpg";
	const headline =
		user?.human_profile?.tagline?.trim() ||
		user?.human_profile?.headline?.trim() ||
		"";
	const isActive = user?.is_active !== false;

	return (
		<SidebarLayout>
			<div>
				<Link
					className="text-sm font-medium text-gray-500 transition-colors hover:text-black"
					href="/admin/users"
				>
					← Back to all users
				</Link>

				<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						{user ? (
							<UserAvatar avatarUrl={avatarUrl} name={displayName} />
						) : null}
						<div>
							<Heading level={1} variant="page-lg">
								{user ? displayName : "User"}
							</Heading>
							{user ? (
								<Text variant="page-subtitle">@{user.username}</Text>
							) : null}
						</div>
					</div>

					{user ? (
						<Button
							href={profilePagePath(user.username)}
							strVariant="transparentWithBorder"
							textTransform="none"
						>
							View public profile
						</Button>
					) : null}
				</div>
			</div>

			<div className="mt-8 space-y-6">
				{!authenticationChecked || (isLoading && !user) ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="loading">Loading user…</Text>
					</div>
				) : error ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="error">
							{accessDenied
								? "Access denied. Sign in with a staff account to continue."
								: "Could not load this user. They may not exist or the API is unavailable."}
						</Text>
					</div>
				) : !user ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-6">
						<Text variant="center-sm">User not found.</Text>
					</div>
				) : (
					<>
						<section className="rounded-2xl border border-gray-200 bg-white p-6">
							<Heading level={2} variant="subsection">
								Account
							</Heading>
							<dl className="mt-4 space-y-4">
								<DetailRow label="User ID">{user.pk}</DetailRow>
								<DetailRow label="First name">
									{user.first_name || "-"}
								</DetailRow>
								<DetailRow label="Last name">{user.last_name || "-"}</DetailRow>
								<DetailRow label="Username">{user.username}</DetailRow>
								<DetailRow label="Email">{user.email}</DetailRow>
								<DetailRow label="Registration method">
									{user.registration_method || "-"}
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
							<dl className="mt-4 space-y-4">
								<DetailRow label="Headline">{headline || "-"}</DetailRow>
								<DetailRow label="City">
									{user.human_profile?.city?.trim() || "-"}
								</DetailRow>
								<DetailRow label="Timezone">
									{user.human_profile?.timezone?.trim() || "-"}
								</DetailRow>
								<DetailRow label="Website">
									{user.human_profile?.personal_website_url?.trim() ? (
										<ExternalLink
											href={user.human_profile.personal_website_url.trim()}
										/>
									) : (
										"-"
									)}
								</DetailRow>
								<DetailRow label="LinkedIn">
									{user.human_profile?.linked_in_url?.trim() ? (
										<ExternalLink
											href={user.human_profile.linked_in_url.trim()}
										/>
									) : (
										"-"
									)}
								</DetailRow>
								<DetailRow label="Instagram">
									{user.human_profile?.instagram_url?.trim() ? (
										<ExternalLink
											href={user.human_profile.instagram_url.trim()}
										/>
									) : (
										"-"
									)}
								</DetailRow>
								<DetailRow label="Facebook">
									{user.human_profile?.facebook_url?.trim() ? (
										<ExternalLink
											href={user.human_profile.facebook_url.trim()}
										/>
									) : (
										"-"
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
					</>
				)}
			</div>
		</SidebarLayout>
	);
}
