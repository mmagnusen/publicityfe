import axios from "axios";

import posthog from "posthog-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { shouldSendPosthogException } from "./posthogProductErrorReporting";

describe("shouldSendPosthogException", () => {
	const originalEnv = process.env;

	afterEach(() => {
		process.env = originalEnv;
		vi.restoreAllMocks();
	});

	it("returns false when PostHog is not configured", () => {
		process.env = {
			...originalEnv,
			NODE_ENV: "production",
			NEXT_PUBLIC_POSTHOG_KEY: "",
		};

		expect(shouldSendPosthogException(new Error("fail"))).toBe(false);
	});

	it("returns true when production, configured, and not staff", () => {
		process.env = {
			...originalEnv,
			NODE_ENV: "production",
			NEXT_PUBLIC_POSTHOG_KEY: "phc_test",
		};
		vi.spyOn(
			posthog as { __loaded?: boolean },
			"__loaded",
			"get",
		).mockReturnValue(true);

		expect(shouldSendPosthogException(new Error("fail"))).toBe(true);
	});

	it("returns false for abort-like errors", () => {
		process.env = {
			...originalEnv,
			NODE_ENV: "production",
			NEXT_PUBLIC_POSTHOG_KEY: "phc_test",
		};
		vi.spyOn(
			posthog as { __loaded?: boolean },
			"__loaded",
			"get",
		).mockReturnValue(true);

		const error = new axios.CanceledError("Request aborted");
		expect(shouldSendPosthogException(error)).toBe(false);
	});
});
