import axios from "axios";

/** Coerce unknown failures into an `Error` for PostHog `captureException`. */
export const normalizeErrorForCapture = (error: unknown): Error => {
	if (error instanceof Error) {
		return error;
	}

	if (axios.isAxiosError(error)) {
		const status = error.response?.status;
		const data = error.response?.data;
		let detail = "";
		if (data && typeof data === "object" && data !== null) {
			const record = data as Record<string, unknown>;
			if (typeof record.detail === "string") {
				detail = record.detail;
			} else if (typeof record.message === "string") {
				detail = record.message;
			}
		}
		const message = [
			error.message || "Request failed",
			status != null ? `(HTTP ${status})` : null,
			detail ? detail.slice(0, 300) : null,
		]
			.filter(Boolean)
			.join(" ");
		const wrapped = new Error(message || "Axios request failed");
		wrapped.name = error.name || "AxiosError";
		wrapped.cause = error;
		return wrapped;
	}

	if (typeof error === "string" && error.trim()) {
		return new Error(error.trim());
	}

	if (error && typeof error === "object") {
		try {
			return new Error(JSON.stringify(error).slice(0, 500));
		} catch {
			return new Error("Non-Error failure object");
		}
	}

	return new Error(String(error));
};
