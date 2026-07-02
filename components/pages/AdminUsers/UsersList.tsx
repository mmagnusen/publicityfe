"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { User } from "@constants/user";
import {
	ADMIN_USERS_PER_PAGE,
	buildAdminUsersPageHref,
	normalizeAdminUsersResponse,
	useAdminUsers,
} from "@hooks/useAdminUsers";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { debounce } from "lodash";
import type { MultiValue, SingleValue } from "react-select";

import Heading from "@/components/Heading";
import Input from "@/components/Input";
import Select, { type SelectOption } from "@/components/Select/Select";
import { SidebarLayout } from "@/components/Sidebar";
import Tag from "@/components/Tag";
import Text from "@/components/Text";
import { resolveBytescaleDisplayUrl } from "@/components/UploadButton";

const USER_STATUS_OPTIONS: SelectOption[] = [
	{ label: "All users", value: "" },
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
];

function ListPagination({
	currentPage,
	search,
	status,
	totalCount,
}: {
	currentPage: number;
	search: string;
	status: string;
	totalCount: number;
}) {
	const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_USERS_PER_PAGE));

	if (totalPages <= 1) {
		return null;
	}

	const prevHref =
		currentPage > 1
			? buildAdminUsersPageHref(currentPage - 1, search, status)
			: undefined;
	const nextHref =
		currentPage < totalPages
			? buildAdminUsersPageHref(currentPage + 1, search, status)
			: undefined;

	return (
		<div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
			<Text variant="caption">
				Page {currentPage} of {totalPages}
			</Text>
			<div className="flex gap-2">
				{prevHref ? (
					<Link
						href={prevHref}
						className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-gray-50"
					>
						Previous
					</Link>
				) : (
					<span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
						Previous
					</span>
				)}
				{nextHref ? (
					<Link
						href={nextHref}
						className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-gray-50"
					>
						Next
					</Link>
				) : (
					<span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
						Next
					</span>
				)}
			</div>
		</div>
	);
}

function UserAvatar({ user }: { user: User }) {
	const avatarUrl =
		resolveBytescaleDisplayUrl(user.human_profile?.profile_image_url) ||
		"/opportunity/reporter.jpg";
	const label = `${user.first_name} ${user.last_name}`.trim() || user.username;

	if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={avatarUrl}
				alt={label}
				className="size-10 rounded-full border border-gray-200 object-cover"
			/>
		);
	}

	return (
		<div className="relative size-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
			<Image
				src={avatarUrl}
				alt={label}
				fill
				sizes="40px"
				className="object-cover"
			/>
		</div>
	);
}

function UserRow({ user }: { user: User }) {
	const isActive = user.is_active !== false;
	const adminUserHref = `/admin/users/${user.pk}`;

	return (
		<li>
			<Link
				href={adminUserHref}
				className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_6rem_minmax(0,1fr)] items-center gap-4 py-4 text-sm transition-colors hover:bg-gray-50/80"
			>
				<UserAvatar user={user} />
				<span className="truncate font-medium text-black">
					{user.first_name} {user.last_name}
				</span>
				<span className="truncate text-gray-700">{user.username}</span>
				<span className="truncate text-gray-700">{user.email}</span>
				<span>
					<Tag skin={isActive ? "green" : "red"}>
						{isActive ? "Active" : "Inactive"}
					</Tag>
				</span>
				<span className="truncate text-gray-500">
					{user.registration_method}
				</span>
			</Link>
		</li>
	);
}

export function UsersList() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { authenticationChecked, isAdmin, isLoggedIn } = useAuthenticatedUser();

	const pageFromQuery = Number(searchParams.get("page")) || 1;
	const currentPage = pageFromQuery >= 1 ? pageFromQuery : 1;
	const searchQuery = searchParams.get("q") ?? "";
	const statusQuery = searchParams.get("status") ?? "";
	const [searchValue, setSearchValue] = useState(searchQuery);

	const selectedStatus =
		USER_STATUS_OPTIONS.find((option) => option.value === statusQuery) ??
		USER_STATUS_OPTIONS[0];

	const { data, error, isLoading } = useAdminUsers(
		currentPage,
		searchQuery,
		statusQuery,
	);
	const list = useMemo(() => normalizeAdminUsersResponse(data), [data]);

	const accessDenied = axios.isAxiosError(error)
		? error.response?.status === 401 || error.response?.status === 403
		: false;

	const debouncedSearch = useMemo(
		() =>
			debounce((value: string) => {
				router.push(buildAdminUsersPageHref(1, value, statusQuery));
			}, 300),
		[router, statusQuery],
	);

	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	useEffect(() => {
		setSearchValue(searchQuery);
	}, [searchQuery]);

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

	const handleStatusChange = (
		value: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => {
		const option = Array.isArray(value) ? value[0] : value;
		router.push(buildAdminUsersPageHref(1, searchQuery, option?.value ?? ""));
	};

	return (
		<SidebarLayout>
			<div>
				<Heading level={1} variant="page-lg">
					Users
				</Heading>
				<Text variant="page-subtitle">
					Search and browse all registered users.
				</Text>
			</div>

			<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
				<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
					<div>
						<label
							className="mb-2 block text-sm font-medium text-gray-900"
							htmlFor="admin-user-search"
						>
							Search
						</label>
						<Input
							bCompact
							id="admin-user-search"
							onChange={(event) => {
								const value = event.target.value;
								setSearchValue(value);
								debouncedSearch(value);
							}}
							placeHolder="Search by first name, last name or email"
							value={searchValue}
						/>
					</div>

					<div>
						<label
							className="mb-2 block text-sm font-medium text-gray-900"
							htmlFor="admin-user-status"
						>
							Status
						</label>
						<Select
							arrOptions={USER_STATUS_OPTIONS}
							bCompact
							id="admin-user-status"
							isSearchable={false}
							onChange={handleStatusChange}
							value={selectedStatus}
						/>
					</div>
				</div>

				<div className="mt-6">
					{!authenticationChecked || (isLoading && !data) ? (
						<Text variant="loading">Loading users…</Text>
					) : error ? (
						<Text variant="error">
							{accessDenied
								? "Access denied. Sign in with a staff account to continue."
								: "Could not load users. Check the API is available and try again."}
						</Text>
					) : list.results.length === 0 ? (
						<Text variant="center-sm">No users found.</Text>
					) : (
						<>
							<Text variant="stat-label">
								{list.count} total user{list.count === 1 ? "" : "s"}
							</Text>

							<div className="mt-4 overflow-x-auto">
								<div className="min-w-4xl">
									<div className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_6rem_minmax(0,1fr)] gap-4 border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
										<span aria-hidden />
										<span>Name</span>
										<span>Username</span>
										<span>Email</span>
										<span>Status</span>
										<span>Registration</span>
									</div>
									<ul className="divide-y divide-gray-200">
										{list.results.map((user) => (
											<UserRow key={user.pk} user={user} />
										))}
									</ul>
								</div>
							</div>

							<ListPagination
								currentPage={currentPage}
								search={searchQuery}
								status={statusQuery}
								totalCount={list.count}
							/>
						</>
					)}
				</div>
			</div>
		</SidebarLayout>
	);
}
