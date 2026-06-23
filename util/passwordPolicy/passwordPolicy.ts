export const isEntirelyNumeric = (password: string): boolean => {
	return /^\d+$/.test(password);
};

export type UserIdentityForPasswordCheck = {
	email: string;
	firstName: string;
	lastName: string;
	username: string;
};

/**
 * Lightweight client hint; the API enforces full Django similarity checks.
 */
export const isPasswordTooSimilarToIdentity = (
	password: string,
	ctx: UserIdentityForPasswordCheck,
): boolean => {
	const p = password.toLowerCase();
	if (!p) return false;

	const parts = [
		ctx.firstName.trim().toLowerCase(),
		ctx.lastName.trim().toLowerCase(),
		ctx.username.trim().toLowerCase(),
		ctx.email.split("@")[0]?.trim().toLowerCase() ?? "",
	].filter((s) => s.length >= 3);

	for (const part of parts) {
		if (p === part) return true;
		if (p.includes(part) || part.includes(p)) return true;
	}
	return false;
};
