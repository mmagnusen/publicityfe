import useSWR from "swr";

import type { PublicUser } from "@customTypes/publicUser";
import fetcher from "@util/fetcher";

import { publicUserPath } from "@/lib/publicUser";

const featuredJournalistsKey = (usernames: string[]) =>
	usernames.length ? (["featured-journalists", ...usernames] as const) : null;

export const useFeaturedJournalists = (usernames: string[]) => {
	return useSWR<PublicUser[]>(
		featuredJournalistsKey(usernames),
		async () => {
			const results = await Promise.all(
				usernames.map((username) =>
					fetcher(publicUserPath(username)).catch(() => null),
				),
			);

			return results.filter((user): user is PublicUser => user != null);
		},
		{ revalidateOnMount: true },
	);
};
