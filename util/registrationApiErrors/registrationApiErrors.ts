import axios from "axios";

const API_KEY_TO_FORMIK: Record<string, string> = {
	first_name: "firstName",
	last_name: "lastName",
	email: "email",
	password: "password",
	username: "username",
};

const messagesToString = (messages: unknown): string => {
	if (Array.isArray(messages)) {
		return messages.filter((m): m is string => typeof m === "string").join(" ");
	}
	if (typeof messages === "string") {
		return messages;
	}
	return "";
};

/**
 * Maps 400 validation payloads from POST /users/ onto Formik fields.
 */
export const applyRegistrationApiErrorsToForm = (
	error: unknown,
	options: {
		setFieldError: (field: string, message: string | undefined) => void;
		setFormError: (message: string) => void;
	},
): boolean => {
	if (!axios.isAxiosError(error) || error.response?.status !== 400) {
		return false;
	}

	const data = error.response.data;
	if (!data || typeof data !== "object" || Array.isArray(data)) {
		return false;
	}

	const obj = data as Record<string, unknown>;
	let applied = false;

	for (const [key, raw] of Object.entries(obj)) {
		if (key === "detail" || key === "non_field_errors") {
			continue;
		}
		const formField = API_KEY_TO_FORMIK[key];
		if (!formField) {
			continue;
		}
		const msg = messagesToString(raw);
		if (msg) {
			options.setFieldError(formField, msg);
			applied = true;
		}
	}

	const nonField = messagesToString(obj.non_field_errors);
	if (nonField) {
		options.setFormError(nonField);
		applied = true;
	}

	if (!applied) {
		if (typeof obj.detail === "string" && obj.detail) {
			options.setFormError(obj.detail);
			applied = true;
		} else if (Array.isArray(obj.detail) && obj.detail.length > 0) {
			const msg = messagesToString(obj.detail);
			if (msg) {
				options.setFormError(msg);
				applied = true;
			}
		}
	}

	return applied;
};
