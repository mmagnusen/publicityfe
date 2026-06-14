/**
 * Bridges `instanceAxios` (no React) and session teardown (lives in auth context).
 * Registered once from AuthenticatedUserContextProvider.
 */

export type SessionInvalidReason = "account_disabled" | "generic";

type UnauthorizedHandler = (
	reason: SessionInvalidReason,
) => void | Promise<void>;

let handler: UnauthorizedHandler | null = null;

let isHandlingUnauthorized = false;

export const setUnauthorizedHandler = (next: UnauthorizedHandler | null) => {
	handler = next;
};

/**
 * Called when an authenticated request (JWT was sent) returns 401 — e.g. deactivated
 * account, revoked user, or invalid token while the client still holds a session.
 * @returns false if no handler ran (e.g. Strict Mode gap) so the caller can hard-reset.
 */
export const notifyUnauthorizedWithJwt = async (
	reason: SessionInvalidReason,
): Promise<boolean> => {
	if (isHandlingUnauthorized) {
		return true;
	}
	if (!handler) {
		return false;
	}
	isHandlingUnauthorized = true;
	try {
		await handler(reason);
		return true;
	} finally {
		isHandlingUnauthorized = false;
	}
};
