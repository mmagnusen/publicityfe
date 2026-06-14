import axios from "axios";

const stringifyMessages = (value: unknown): string | undefined => {
	if (Array.isArray(value)) {
		const s = value.filter((m): m is string => typeof m === "string").join(" ");
		return s || undefined;
	}
	if (typeof value === "string" && value) {
		return value;
	}
	return undefined;
};

export const emailDomainFromAddress = (
	email: string | undefined,
): string | null => {
	if (!email?.includes("@")) return null;
	const domain = email.split("@")[1]?.trim().toLowerCase();
	return domain || null;
};

export type ParsedLoginApiError = {
	/** Shown in the form alert (e.g. `non_field_errors`, `detail`) */
	formMessage: string | null;
	email?: string;
	password?: string;
};

/**
 * Parses error bodies from POST /users/api-token-auth/ (JWT login).
 */
export const parseLoginApiError = (error: unknown): ParsedLoginApiError => {
	const empty: ParsedLoginApiError = { formMessage: null };

	if (!axios.isAxiosError(error)) {
		return empty;
	}

	const raw = error.response?.data;
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return empty;
	}

	const data = raw as Record<string, unknown>;

	let formMessage: string | null =
		stringifyMessages(data.non_field_errors) ?? null;

	if (!formMessage) {
		const detail = data.detail;
		if (typeof detail === "string") {
			formMessage = detail || null;
		} else {
			formMessage = stringifyMessages(detail) ?? null;
		}
	}

	return {
		formMessage,
		email: stringifyMessages(data.email),
		password: stringifyMessages(data.password),
	};
};
