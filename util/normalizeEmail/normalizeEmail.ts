/**
 * Trim and lowercase the full address before login, register, or forgot-password
 * requests so casing matches the backend (email__iexact / stored value behavior).
 */
export const normalizeEmail = (email: string): string => {
	return email.trim().toLowerCase();
};
