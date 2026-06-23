import useSWR from "swr";

import type { PublicUser } from "@customTypes/publicUser";
import fetcher from "@util/fetcher";

import { publicUserPath } from "@/lib/publicUser";

export const usePublicUser = (username: string | null | undefined) => {
	const trimmed = username?.trim() ?? "";

	return useSWR<PublicUser>(trimmed ? publicUserPath(trimmed) : null, fetcher, {
		revalidateOnMount: true,
	});
};
