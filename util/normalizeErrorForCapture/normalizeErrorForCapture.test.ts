import axios from "axios";

import { afterEach, describe, expect, it, vi } from "vitest";

import { normalizeErrorForCapture } from "./normalizeErrorForCapture";

describe("normalizeErrorForCapture", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns Error instances unchanged", () => {
		const err = new Error("boom");
		expect(normalizeErrorForCapture(err)).toBe(err);
	});

	it("wraps axios-shaped errors", () => {
		const err = {
			isAxiosError: true,
			message: "Request failed with status code 401",
			name: "AxiosError",
			response: {
				status: 401,
				data: { detail: "Invalid credentials" },
			},
		};
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const normalized = normalizeErrorForCapture(err);
		expect(normalized).toBeInstanceOf(Error);
		expect(normalized.message).toContain("Invalid credentials");
	});
});
