import axios from "axios";
import useSWR, { mutate } from "swr";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";
import { instanceAxios } from "@util/instanceAxios";

import {
	type AdminApplication,
	type AdminApplicationApprovalStatus,
	adminApplicationDetailPath,
	fetchAdminApplication,
} from "@/lib/adminApplications";

const ADMIN_APPLICATIONS_PATH = "/opportunities/admin/applications";

const APPLICATIONS_PER_PAGE = 20;

type AdminApplicationsPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: AdminApplication[];
};

const adminApplicationsListKey = (page: number, perPage: number) => {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return `${ADMIN_APPLICATIONS_PATH}?${query.toString()}`;
};

export const useAdminApplications = (
	page: number,
	perPage: number = APPLICATIONS_PER_PAGE,
) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();

	return useSWR<AdminApplicationsPaginatedResponse>(
		isLoggedIn && isAdmin ? adminApplicationsListKey(page, perPage) : null,
		fetcher,
		{ revalidateOnMount: true },
	);
};

export const useAdminApplication = (pk: number | null) => {
	const { isAdmin, isLoggedIn } = useAuthenticatedUser();
	const detailPath =
		pk != null && Number.isFinite(pk) && pk > 0
			? adminApplicationDetailPath(pk)
			: null;

	return useSWR<AdminApplication>(
		isLoggedIn && isAdmin && detailPath ? detailPath : null,
		() => fetchAdminApplication(pk as number),
		{ revalidateOnMount: true },
	);
};

export const getAdminApplicationApiErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		const status = error.response?.status;
		if (status === 401 || status === 403) {
			return "Access denied. Sign in with a staff account to continue.";
		}
		if (status === 404) {
			return "Application not found.";
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return "Could not load this application. Try again.";
};

export type AdminApplicationUpdatePayload = {
	approval_status?: AdminApplicationApprovalStatus;
};

export const patchAdminApplication = async (
	pk: number,
	payload: AdminApplicationUpdatePayload,
): Promise<AdminApplication> => {
	const { data } = await instanceAxios.patch<AdminApplication>(
		adminApplicationDetailPath(pk),
		payload,
	);
	return data;
};

export const revalidateAdminApplicationCaches = async (pk?: number) => {
	await mutate(
		(key) => typeof key === "string" && key.startsWith(ADMIN_APPLICATIONS_PATH),
		undefined,
		{ revalidate: true },
	);

	if (pk != null && Number.isFinite(pk) && pk > 0) {
		await mutate(adminApplicationDetailPath(pk));
	}
};

export { APPLICATIONS_PER_PAGE, adminApplicationDetailPath };
