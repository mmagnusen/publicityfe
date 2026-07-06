import { mutate } from "swr";

import {
	revalidateOpportunityDetailCaches,
	revalidateOpportunityLists,
} from "@hooks/useOpportunities";
import { instanceAxios } from "@util/instanceAxios";

export const MY_APPLICATIONS_PATH = "/opportunities/my-applications";

export type ApplicationApprovalStatus = "submitted" | "approved";

const APPLICATION_APPROVAL_STATUSES: ApplicationApprovalStatus[] = [
	"submitted",
	"approved",
];

export type MyApplication = {
	pk: number;
	opportunity_id: number;
	opportunity_title: string;
	message: string;
	approval_status?: ApplicationApprovalStatus | string | null;
	created_at: string;
	updated_at?: string;
};

export type MyApplicationsPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: MyApplication[];
};

export type NormalizedMyApplicationsList = {
	results: MyApplication[];
	count: number;
	next: string | null;
	previous: string | null;
};

export const parseApplicationApprovalStatus = (
	value: string | null | undefined,
): ApplicationApprovalStatus | null => {
	if (
		value &&
		APPLICATION_APPROVAL_STATUSES.includes(value as ApplicationApprovalStatus)
	) {
		return value as ApplicationApprovalStatus;
	}

	return null;
};

export const formatApplicationApprovalStatusLabel = (
	status: ApplicationApprovalStatus,
): string => {
	if (status === "approved") {
		return "Approved";
	}

	return "Submitted";
};

export const myApplicationsListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${MY_APPLICATIONS_PATH}?${query.toString()}`;
};

export const normalizeMyApplicationsResponse = (
	data: unknown,
): NormalizedMyApplicationsList => {
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

	const page = data as Partial<MyApplicationsPaginatedResponse>;
	return {
		results: page.results ?? [],
		count: page.count ?? page.results?.length ?? 0,
		next: page.next ?? null,
		previous: page.previous ?? null,
	};
};

type SubmitApplicationPayload = {
	message: string;
	opportunityId: number;
};

export async function submitApplication({
	message,
	opportunityId,
}: SubmitApplicationPayload): Promise<void> {
	await instanceAxios({
		method: "post",
		url: "/opportunities/submit-application",
		data: {
			opportunity_id: opportunityId,
			message: message.trim(),
		},
	});

	await revalidateMyApplications();
	await revalidateOpportunityDetailCaches(opportunityId);
	await revalidateOpportunityLists();
}

export const revalidateMyApplications = async () => {
	await mutate(
		(key) => typeof key === "string" && key.startsWith(MY_APPLICATIONS_PATH),
		undefined,
		{ revalidate: true },
	);
};
