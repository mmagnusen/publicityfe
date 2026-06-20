import type { PublicUser } from "@customTypes/publicUser";

export const PUBLIC_USERS_PATH = "/users/public-users";

export const publicUserPath = (username: string) =>
	`/users/public-user/${encodeURIComponent(username.trim())}`;

export const publicUserDisplayName = (
	user: Pick<PublicUser, "first_name" | "last_name" | "username">,
): string =>
	[user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
	user.username;

export const profilePagePath = (username: string) =>
	`/profile/${encodeURIComponent(username.trim())}`;

const getApiBackendUrl = (): string | undefined =>
	process.env.API_BACKEND_URL?.replace(/\/+$/, "");

/** Server-side fetch by username — used for `/profile/[username]` pages. */
export async function fetchPublicUserByUsername(
	username: string,
): Promise<PublicUser | null> {
	const baseUrl = getApiBackendUrl();
	const trimmed = username.trim();
	if (!baseUrl || !trimmed) {
		return null;
	}

	try {
		const response = await fetch(`${baseUrl}${publicUserPath(trimmed)}`, {
			cache: "no-store",
		});
		if (!response.ok) {
			return null;
		}
		return (await response.json()) as PublicUser;
	} catch {
		return null;
	}
}
