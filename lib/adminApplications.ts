import axios from "axios";

import fetcher from "@util/fetcher";

const ADMIN_APPLICATIONS_LIST_PATH = "/opportunities/admin/applications";
const ADMIN_APPLICATION_PATH = "/opportunities/admin/application";

export const adminApplicationPatchPath = (pk: number) =>
	`${ADMIN_APPLICATION_PATH}/${pk}`;

export const adminApplicationDetailPath = (pk: number) =>
	`${ADMIN_APPLICATIONS_LIST_PATH}/${pk}`;

export type AdminApplicationApprovalStatus = "submitted" | "approved";

const ADMIN_APPLICATION_APPROVAL_STATUSES: AdminApplicationApprovalStatus[] = [
	"submitted",
	"approved",
];

export type AdminApplication = {
	pk: number;
	opportunity_id: number;
	opportunity_title: string;
	applicant_username: string;
	applicant_first_name: string;
	applicant_last_name: string;
	applicant_pk?: number | null;
	applicant?: number | { pk?: number | null } | null;
	message: string;
	approval_status?: AdminApplicationApprovalStatus | string | null;
	created_at: string;
	updated_at?: string;
};

export const parseAdminApplicationApprovalStatus = (
	value: string | null | undefined,
): AdminApplicationApprovalStatus | null => {
	if (
		value &&
		ADMIN_APPLICATION_APPROVAL_STATUSES.includes(
			value as AdminApplicationApprovalStatus,
		)
	) {
		return value as AdminApplicationApprovalStatus;
	}

	return null;
};

export const formatAdminApplicationApprovalStatusLabel = (
	status: AdminApplicationApprovalStatus,
): string => {
	if (status === "approved") {
		return "Approved";
	}

	return "Submitted";
};

export type AdminApplicationApprovalStatusFilter =
	| ""
	| AdminApplicationApprovalStatus;

export const ADMIN_APPLICATION_APPROVAL_STATUS_FILTER_OPTIONS = [
	{ label: "All statuses", value: "" },
	{ label: "Submitted", value: "submitted" },
	{ label: "Approved", value: "approved" },
] as const satisfies ReadonlyArray<{
	label: string;
	value: AdminApplicationApprovalStatusFilter;
}>;

export const parseAdminApplicationApprovalStatusFromSearchParams = (
	searchParams: Pick<URLSearchParams, "get">,
): AdminApplicationApprovalStatusFilter => {
	const status = searchParams.get("approval_status") ?? "";
	return parseAdminApplicationApprovalStatus(status) ?? "";
};

export const buildAdminApplicationsPageHref = (
	page: number,
	approvalStatus: AdminApplicationApprovalStatusFilter = "",
): string => {
	const query = new URLSearchParams();
	if (page > 1) {
		query.set("page", String(page));
	}
	if (approvalStatus) {
		query.set("approval_status", approvalStatus);
	}
	const queryString = query.toString();
	return queryString
		? `/admin/applications?${queryString}`
		: "/admin/applications";
};

export { ADMIN_APPLICATIONS_LIST_PATH as ADMIN_APPLICATIONS_PATH };

export const applicationApplicantPk = (
	application: AdminApplication,
): number | null => {
	const flatPk = application.applicant_pk;
	if (flatPk != null && flatPk > 0) {
		return flatPk;
	}

	const applicant = application.applicant;
	if (typeof applicant === "number" && applicant > 0) {
		return applicant;
	}

	if (applicant != null && typeof applicant === "object") {
		const nestedPk = applicant.pk;
		if (nestedPk != null && nestedPk > 0) {
			return nestedPk;
		}
	}

	return null;
};

const findApplicationInList = async (
	pk: number,
): Promise<AdminApplication | null> => {
	let page = 1;
	const perPage = 100;

	while (page <= 20) {
		const data = await fetcher(ADMIN_APPLICATIONS_LIST_PATH, {
			page,
			per_page: perPage,
		});

		const results = Array.isArray(data?.results) ? data.results : [];
		const match = results.find(
			(application: AdminApplication) => application.pk === pk,
		);
		if (match) {
			return match;
		}

		if (!data?.next || results.length < perPage) {
			break;
		}

		page += 1;
	}

	return null;
};

export const fetchAdminApplication = async (
	pk: number,
): Promise<AdminApplication> => {
	try {
		return await fetcher(adminApplicationDetailPath(pk));
	} catch (error) {
		if (!axios.isAxiosError(error) || error.response?.status !== 404) {
			throw error;
		}
	}

	const fromList = await findApplicationInList(pk);
	if (fromList) {
		return fromList;
	}

	throw new Error("Application not found.");
};
