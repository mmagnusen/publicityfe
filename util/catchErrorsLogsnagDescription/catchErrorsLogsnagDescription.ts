import axios from "axios";

const MAX_FIELD_LENGTH = 200;
const MAX_RESPONSE_LENGTH = 400;

const appendField = (
	parts: string[],
	key: string,
	value: unknown,
	maxLength = MAX_FIELD_LENGTH,
): void => {
	if (value == null || value === "") return;
	const text =
		typeof value === "string"
			? value
			: typeof value === "number" || typeof value === "boolean"
				? String(value)
				: (() => {
						try {
							return JSON.stringify(value);
						} catch {
							return String(value);
						}
					})();
	const trimmed = text.trim();
	if (!trimmed) return;
	parts.push(`${key}=${trimmed.slice(0, maxLength)}`);
};

const appendAxiosResponse = (parts: string[], error: unknown): void => {
	if (!axios.isAxiosError(error)) return;

	if (error.response?.status != null) {
		appendField(parts, "http_status", error.response.status);
	}
	if (error.code) {
		appendField(parts, "axios_code", error.code);
	}

	const data = error.response?.data;
	if (data == null) return;

	if (typeof data === "object" && data !== null) {
		const detail = (data as Record<string, unknown>).detail;
		if (typeof detail === "string" && detail.trim()) {
			appendField(parts, "detail", detail);
		}
	}

	appendField(parts, "response", data, MAX_RESPONSE_LENGTH);
};

export type CatchErrorsDescriptionExtras = Record<string, unknown>;

/** Safe one-line context for LogSnag `catch-errors` channel (no passwords / tokens). */
export const catchErrorsDescription = (
	action: string,
	error: unknown,
	extras?: CatchErrorsDescriptionExtras,
): string => {
	const parts = [`action=${action}`];

	if (extras) {
		for (const [key, value] of Object.entries(extras)) {
			appendField(parts, key, value);
		}
	}

	appendAxiosResponse(parts, error);

	if (!axios.isAxiosError(error) && error instanceof Error && error.message) {
		appendField(parts, "message", error.message);
	}

	return parts.join(". ");
};
