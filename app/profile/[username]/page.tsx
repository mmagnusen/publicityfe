export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { FounderProfileDetail } from "@/components/founder-profile-detail";
import {
	profileFormValuesFromPublicUser,
	profileLinksFromPublicUser,
} from "@/lib/profileForm";
import { getProfile } from "@/lib/profiles";
import {
	fetchPublicUserByUsername,
	publicUserDisplayName,
} from "@/lib/publicUser";
import { tipTapApiValueToPlainText } from "@/lib/tiptap-utils";

type ProfilePageProps = {
	params: Promise<{ username: string }>;
};

export async function generateMetadata({
	params,
}: ProfilePageProps): Promise<Metadata> {
	const { username } = await params;
	const apiUser = await fetchPublicUserByUsername(decodeURIComponent(username));
	const mockProfile = apiUser ? getProfile(String(apiUser.pk)) : null;
	const name = apiUser ? publicUserDisplayName(apiUser) : mockProfile?.name;

	if (!name) {
		return { title: "Profile not found — Spotlight" };
	}

	return {
		title: `${name} — Spotlight`,
		description:
			tipTapApiValueToPlainText(apiUser?.human_profile?.bio) ||
			mockProfile?.bio[0],
	};
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const { username } = await params;
	const apiUser = await fetchPublicUserByUsername(decodeURIComponent(username));

	if (!apiUser) {
		notFound();
	}

	const profile = getProfile(String(apiUser.pk));

	if (!profile) {
		notFound();
	}

	return (
		<FounderProfileDetail
			profile={profile}
			displayName={publicUserDisplayName(apiUser)}
			avatarUrl={apiUser.human_profile?.profile_image_url}
			tagline={
				apiUser.human_profile?.tagline ?? apiUser.human_profile?.headline
			}
			bio={apiUser.human_profile?.bio}
			links={profileLinksFromPublicUser(apiUser)}
			tags={apiUser.tags ?? []}
			profileUsername={apiUser.username}
			profileFormValues={profileFormValuesFromPublicUser(apiUser)}
		/>
	);
}
