/** Staff reports admin API — aligns with GET /reports/fetch-admin-reports list items. */

export type AdminReportTarget =
	| { type: "wanted_ad"; id: number }
	| { type: "offered_ad"; id: number }
	| { type: "user"; id: number };

export type AdminReportListRow = {
	pk: number;
	created_at: string;
	category: string;
	status: string;
	reporter_email: string;
	target: AdminReportTarget | null;
};

export type AdminReportsPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: AdminReportListRow[];
};

export type AdminReportUserSnippet = {
	pk: number;
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	is_active: boolean;
};

/** GET /reports/report/<pk> full detail. */
export type AdminReportDetail = {
	pk: number;
	created_at: string;
	category: string;
	status: string;
	details: string | null;
	reporter_email: string;
	reporter_user: AdminReportUserSnippet | null;
	submitted_by: AdminReportUserSnippet | null;
	reported_user: AdminReportUserSnippet | null;
	target: AdminReportTarget | null;
};

export const ADMIN_REPORT_STATUSES = [
	"submitted",
	"in_progress",
	"resolved",
] as const;

export type AdminReportStatus = (typeof ADMIN_REPORT_STATUSES)[number];
