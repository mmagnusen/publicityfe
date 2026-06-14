/** Django user serializer fields for Stripe Identity (snake_case). */
export type IdentityVerificationApiFields = {
	identity_verified?: boolean;
	identity_verification_status?: string | null;
	identity_verification_error?: string | null;
};

export type NormalizedIdentityFields = {
	identityVerified: boolean;
	identityVerificationStatus: string | null;
	identityVerificationError: string | null;
};

export const identityFieldsFromApiUser = (
	apiUser: IdentityVerificationApiFields | null | undefined,
): NormalizedIdentityFields => {
	if (!apiUser) {
		return {
			identityVerified: false,
			identityVerificationStatus: null,
			identityVerificationError: null,
		};
	}
	const err = apiUser.identity_verification_error;
	return {
		identityVerified: Boolean(apiUser.identity_verified),
		identityVerificationStatus:
			apiUser.identity_verification_status == null ||
			apiUser.identity_verification_status === ""
				? null
				: String(apiUser.identity_verification_status),
		identityVerificationError:
			err == null || String(err).trim() === "" ? null : String(err).trim(),
	};
};

type IdentityPrev = {
	identityVerified?: boolean;
	identityVerificationStatus?: string | null;
	identityVerificationError?: string | null;
};

/** Merge identity fields from PATCH /users/update-user when only some keys are present. */
export const mergeIdentityFieldsFromPatch = (
	data: Record<string, unknown>,
	prev: IdentityPrev | null,
): NormalizedIdentityFields => {
	const p = prev ?? {};
	const normStatus = (v: unknown): string | null =>
		v == null || v === "" ? null : String(v);
	const normErr = (v: unknown): string | null =>
		v == null || String(v).trim() === "" ? null : String(v).trim();

	return {
		identityVerified: Object.hasOwn(data, "identity_verified")
			? Boolean(data.identity_verified)
			: Boolean(p.identityVerified ?? false),
		identityVerificationStatus: Object.hasOwn(
			data,
			"identity_verification_status",
		)
			? normStatus(data.identity_verification_status)
			: (p.identityVerificationStatus ?? null),
		identityVerificationError: Object.hasOwn(
			data,
			"identity_verification_error",
		)
			? normErr(data.identity_verification_error)
			: (p.identityVerificationError ?? null),
	};
};

export type IdentityDashboardUiState =
	| { status: "not_started" }
	| { status: "processing" }
	| { status: "needs_action"; message: string }
	| { status: "verified" };

/**
 * Prefer latest `identity_verification_status` for in-flight flow; fall back to
 * `identity_verified` when status is absent but the user has been verified before.
 */
export const getIdentityDashboardUiState = (
	identityVerifiedFlag: boolean | null | undefined,
	status: string | null | undefined,
	error: string | null | undefined,
): IdentityDashboardUiState => {
	const s =
		status === undefined || status === null || status === ""
			? null
			: String(status);

	if (s === "verified") {
		return { status: "verified" };
	}
	if (s === "processing") {
		return { status: "processing" };
	}
	if (s === "requires_input" || s === "canceled") {
		return {
			status: "needs_action",
			message:
				error?.trim() ||
				"Your verification needs attention. You can continue in Stripe.",
		};
	}
	if (s === null && identityVerifiedFlag === true) {
		return { status: "verified" };
	}
	if (s === null) {
		return { status: "not_started" };
	}
	return { status: "processing" };
};
