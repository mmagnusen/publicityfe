export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { FounderProfileDetail } from "@/components/founder-profile-detail";
import { TRADING_NAME } from "@/constants/tradingName";
import {
	profileFormValuesFromPublicUser,
	profileLinksFromPublicUser,
} from "@/lib/profileForm";
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
	const name = apiUser ? publicUserDisplayName(apiUser) : null;

	if (!name) {
		return { title: `Profile not found- ${TRADING_NAME}` };
	}

	return {
		title: `${name}- ${TRADING_NAME}`,
		description:
			tipTapApiValueToPlainText(apiUser?.human_profile?.bio) || undefined,
	};
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const { username } = await params;
	const apiUser = await fetchPublicUserByUsername(decodeURIComponent(username));

	if (!apiUser) {
		notFound();
	}

	return (
		<FounderProfileDetail
			contactEmail={apiUser.email ?? null}
			displayName={publicUserDisplayName(apiUser)}
			avatarUrl={apiUser.human_profile?.profile_image_url}
			location={apiUser.human_profile?.city}
			tagline={
				apiUser.human_profile?.tagline ?? apiUser.human_profile?.headline
			}
			bio={apiUser.human_profile?.bio}
			links={profileLinksFromPublicUser(apiUser)}
			tags={apiUser.tags ?? []}
			gallery={apiUser.customusergalleryasset_set ?? []}
			highlights={apiUser.profile_links ?? []}
			profileUsername={apiUser.username}
			profileFormValues={profileFormValuesFromPublicUser(apiUser)}
			userPk={apiUser.pk}
		/>
	);
}
