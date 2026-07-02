import type { User } from "@constants/user";

export type AdminUsersPaginatedResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: User[];
};

export type AdminUserStatusFilter = "" | "active" | "inactive";
