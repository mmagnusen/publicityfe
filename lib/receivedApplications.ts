import axios from "axios";

import fetcher from "@util/fetcher";
import { instanceAxios } from "@util/instanceAxios";

import type { ApplicationApprovalStatus } from "@/lib/applications";

export const RECEIVED_APPLICATIONS_PATH =
	"/opportunities/opportunity-applications";

export const RECEIVED_APPLICATION_CONTACT_PATH = "/opportunities/application";

export type ReceivedApplicationDisplayStatus =
	| "new"
	| "shortlisted"
	| "contacted"
	| "accepted"
	| "declined";

export type ReceivedApplicationFilterStatus =
	| "all"
	| ReceivedApplicationDisplayStatus;

export type ReceivedApplication = {
	pk: number;
	opportunity_id: number;
	opportunity_title: string;
	opportunity_media_outlet_name?: string | null;
	opportunity_type?: string | null;
	opportunity_application_deadline?: string | null;
	applicant_username?: string;
	applicant_email?: string | null;
	applicant_first_name?: string;
	applicant_last_name?: string;
	applicant_headline?: string | null;
	applicant_city?: string | null;
	applicant_tags?: string[] | null;
	message: string;
	approval_status?: ApplicationApprovalStatus | string | null;
	status?: string | null;
	contacted?: boolean;
	created_at: string;
	updated_at?: string;
};

export type ReceivedApplicationsPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: ReceivedApplication[];
};

export type NormalizedReceivedApplicationsList = {
	results: ReceivedApplication[];
	count: number;
	next: string | null;
	previous: string | null;
};

export const RECEIVED_APPLICATION_FILTER_OPTIONS: Array<{
	id: ReceivedApplicationFilterStatus;
	label: string;
}> = [
	{ id: "all", label: "All" },
	{ id: "new", label: "New" },
	{ id: "shortlisted", label: "Shortlisted" },
	{ id: "contacted", label: "Contacted" },
	{ id: "accepted", label: "Accepted" },
	{ id: "declined", label: "Declined" },
];

const AVATAR_PALETTES = [
	{ bg: "bg-violet-100", text: "text-violet-700" },
	{ bg: "bg-green-100", text: "text-green-700" },
	{ bg: "bg-amber-100", text: "text-amber-800" },
	{ bg: "bg-sky-100", text: "text-sky-700" },
	{ bg: "bg-rose-100", text: "text-rose-700" },
] as const;

export const receivedApplicationsListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${RECEIVED_APPLICATIONS_PATH}?${query.toString()}`;
};

export const receivedApplicationDetailPath = (pk: number) =>
	`/applications-received/${pk}`;

export const receivedApplicationPatchPath = (pk: number) =>
	`${RECEIVED_APPLICATION_CONTACT_PATH}/${pk}`;

const findReceivedApplicationInList = async (
	pk: number,
): Promise<ReceivedApplication | null> => {
	let page = 1;
	const perPage = 100;

	while (page <= 20) {
		const data = await fetcher(receivedApplicationsListKey(page, perPage));
		const normalized = normalizeReceivedApplicationsResponse(data);
		const match = normalized.results.find(
			(application) => application.pk === pk,
		);

		if (match) {
			return match;
		}

		if (!normalized.next || normalized.results.length < perPage) {
			break;
		}

		page += 1;
	}

	return null;
};

export const fetchReceivedApplication = async (
	pk: number,
): Promise<ReceivedApplication> => {
	const fromList = await findReceivedApplicationInList(pk);
	if (fromList) {
		return fromList;
	}

	throw new Error("Application not found.");
};

export const patchReceivedApplication = async (
	pk: number,
	payload: Record<string, unknown>,
): Promise<ReceivedApplication> => {
	const { data } = await instanceAxios.patch<ReceivedApplication>(
		receivedApplicationPatchPath(pk),
		payload,
	);
	return data;
};

export const getReceivedApplicationApiErrorMessage = (
	error: unknown,
): string => {
	if (axios.isAxiosError(error)) {
		const status = error.response?.status;
		if (status === 401 || status === 403) {
			return "You do not have permission to manage this application.";
		}
		if (status === 404) {
			return "Application not found.";
		}

		const data = error.response?.data;
		if (typeof data === "string" && data.trim()) {
			return data;
		}
		if (data && typeof data === "object" && !Array.isArray(data)) {
			for (const value of Object.values(data)) {
				if (Array.isArray(value) && typeof value[0] === "string") {
					return value[0];
				}
				if (typeof value === "string") {
					return value;
				}
			}
		}
	}

	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}

	return "Something went wrong.";
};

export const formatReceivedApplicationAppliedAt = (
	dateString: string,
): string => {
	const relative = formatReceivedApplicationRelativeTime(dateString);

	if (relative === "Just now") {
		return "Applied just now";
	}

	return `Applied ${relative}`;
};

export const formatOpportunityDeadlineLabel = (
	deadline: string | null | undefined,
): string | null => {
	if (!deadline?.trim()) {
		return null;
	}

	const date = new Date(deadline);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

export const receivedApplicationFeaturedPublications = (
	highlights: Array<{ publication: string }> | null | undefined,
): string | null => {
	const publications = (highlights ?? [])
		.map((highlight) => highlight.publication?.trim())
		.filter(Boolean);

	if (publications.length === 0) {
		return null;
	}

	return `Previously featured in ${publications.join(", ")}`;
};

export const normalizeReceivedApplicationsResponse = (
	data: unknown,
): NormalizedReceivedApplicationsList => {
	if (data == null) {
		return { results: [], count: 0, next: null, previous: null };
	}

	if (Array.isArray(data)) {
		return {
			results: data,
			count: data.length,
			next: null,
			previous: null,
		};
	}

	const page = data as Partial<ReceivedApplicationsPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

export const receivedApplicantDisplayName = (
	application: ReceivedApplication,
): string => {
	const fullName = [
		application.applicant_first_name,
		application.applicant_last_name,
	]
		.filter(Boolean)
		.join(" ")
		.trim();

	if (fullName) {
		return fullName;
	}

	return application.applicant_username?.trim() || "Applicant";
};

export const receivedApplicantInitials = (
	application: ReceivedApplication,
): string => {
	const first = application.applicant_first_name?.trim().charAt(0) ?? "";
	const last = application.applicant_last_name?.trim().charAt(0) ?? "";

	if (first || last) {
		return `${first}${last}`.toUpperCase();
	}

	const username = application.applicant_username?.trim();
	return username ? username.charAt(0).toUpperCase() : "?";
};

export const receivedApplicantAvatarPalette = (seed: string) => {
	let hash = 0;

	for (const char of seed) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}

	return AVATAR_PALETTES[hash % AVATAR_PALETTES.length] ?? AVATAR_PALETTES[0];
};

export const parseReceivedApplicationDisplayStatus = (
	application: ReceivedApplication,
): ReceivedApplicationDisplayStatus => {
	const raw = (application.status ?? application.approval_status ?? "")
		.trim()
		.toLowerCase();

	if (raw === "shortlisted") {
		return "shortlisted";
	}

	if (application.contacted === true) {
		return "contacted";
	}

	if (raw === "contacted") {
		return "contacted";
	}

	if (raw === "approved" || raw === "accepted") {
		return "accepted";
	}

	if (raw === "declined" || raw === "rejected") {
		return "declined";
	}

	return "new";
};

export const formatReceivedApplicationStatusLabel = (
	status: ReceivedApplicationDisplayStatus,
): string => {
	switch (status) {
		case "shortlisted":
			return "Shortlisted";
		case "contacted":
			return "Contacted";
		case "accepted":
			return "Accepted";
		case "declined":
			return "Declined";
		default:
			return "New";
	}
};

export const receivedApplicationStatusBadgeClassName = (
	status: ReceivedApplicationDisplayStatus,
): string => {
	switch (status) {
		case "shortlisted":
			return "bg-amber-50 text-amber-800";
		case "contacted":
			return "bg-blue-50 text-blue-700";
		case "accepted":
			return "bg-blue-50 text-blue-700";
		case "declined":
			return "bg-gray-100 text-gray-600";
		default:
			return "bg-green-50 text-green-700";
	}
};

export const filterReceivedApplications = (
	applications: ReceivedApplication[],
	filter: ReceivedApplicationFilterStatus,
): ReceivedApplication[] => {
	if (filter === "all") {
		return applications;
	}

	return applications.filter(
		(application) =>
			parseReceivedApplicationDisplayStatus(application) === filter,
	);
};

export const countReceivedApplicationsByStatus = (
	applications: ReceivedApplication[],
): Record<ReceivedApplicationFilterStatus, number> => {
	const counts: Record<ReceivedApplicationFilterStatus, number> = {
		all: applications.length,
		new: 0,
		shortlisted: 0,
		contacted: 0,
		accepted: 0,
		declined: 0,
	};

	for (const application of applications) {
		const status = parseReceivedApplicationDisplayStatus(application);
		counts[status] += 1;
	}

	return counts;
};

export const receivedApplicationMessageSnippet = (
	message: string | null | undefined,
	maxLength = 110,
): string => {
	const plain = (message ?? "")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (!plain) {
		return "";
	}

	if (plain.length <= maxLength) {
		return plain;
	}

	return `${plain.slice(0, maxLength).trim()}…`;
};

export const formatReceivedApplicationRelativeTime = (
	dateString: string,
): string => {
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) {
		return dateString;
	}

	const diffMs = Date.now() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));

	if (diffMinutes < 1) {
		return "Just now";
	}

	if (diffMinutes < 60) {
		return diffMinutes === 1 ? "1 min ago" : `${diffMinutes} mins ago`;
	}

	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) {
		return diffHours === 1 ? "1 hr ago" : `${diffHours} hrs ago`;
	}

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) {
		return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
	}

	return date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
	});
};

export const receivedApplicationOpportunitySubtitle = (
	applications: ReceivedApplication[],
): string | null => {
	if (applications.length === 0) {
		return null;
	}

	const opportunityIds = new Set(
		applications.map((application) => application.opportunity_id),
	);

	if (opportunityIds.size !== 1) {
		return null;
	}

	const first = applications[0];
	const title = first.opportunity_title?.trim();
	const outlet = first.opportunity_media_outlet_name?.trim();

	if (title && outlet) {
		return `${title} · ${outlet}`;
	}

	return title ?? outlet ?? null;
};

export const receivedApplicationMetaLine = (
	application: ReceivedApplication,
	headline?: string | null,
	city?: string | null,
): string => {
	const parts = [
		headline?.trim() || application.applicant_headline?.trim(),
		city?.trim() || application.applicant_city?.trim(),
	].filter(Boolean);

	return parts.join(" · ");
};

export const receivedApplicationTagNames = (
	application: ReceivedApplication,
	profileTagNames: string[] = [],
): string[] => {
	const inlineTags = (application.applicant_tags ?? [])
		.map((tag) => tag?.trim())
		.filter(Boolean) as string[];

	const merged = [...inlineTags, ...profileTagNames];
	const unique = [...new Set(merged.map((tag) => tag.trim()))].filter(Boolean);

	return unique.slice(0, 2);
};
