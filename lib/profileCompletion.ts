import type { PublicUser } from "@customTypes/publicUser";

import { tipTapApiValueToPlainText } from "@/lib/tiptap-utils";

export type ProfileCompletionStepId = "bio" | "press" | "social" | "photo";

export type ProfileCompletionStep = {
	id: ProfileCompletionStepId;
	label: string;
	subtitle?: string;
	complete: boolean;
};

const hasProfilePhoto = (
	profileImageUrl: string | null | undefined,
	cookieProfilePic: string | null | undefined,
): boolean => Boolean(profileImageUrl?.trim() || cookieProfilePic?.trim());

const hasBioAndIndustry = (user: PublicUser | undefined): boolean => {
	if (!user) {
		return false;
	}

	const bio = tipTapApiValueToPlainText(user.human_profile?.bio).trim();
	const hasBio = bio.length > 0;
	const hasTags = (user.tags?.length ?? 0) > 0;

	return hasBio && hasTags;
};

const hasPressCoverage = (user: PublicUser | undefined): boolean =>
	(user?.profile_links?.length ?? 0) > 0;

const hasSocialProfiles = (user: PublicUser | undefined): boolean => {
	const profile = user?.human_profile;
	if (!profile) {
		return false;
	}

	return [
		profile.linked_in_url,
		profile.instagram_url,
		profile.personal_website_url,
		profile.facebook_url,
	].some((url) => url?.trim());
};

export const PROFILE_COMPLETION_TOTAL = 4;

export function getProfileCompletionSteps({
	profileUser,
	profilePicURL,
}: {
	profileUser: PublicUser | undefined;
	profilePicURL: string | null | undefined;
}): ProfileCompletionStep[] {
	return [
		{
			id: "bio",
			label: "Add your bio and industry",
			subtitle: "Tell journalists what you do and what you speak about",
			complete: hasBioAndIndustry(profileUser),
		},
		{
			id: "press",
			label: "Add your previous press coverage",
			subtitle: "Show journalists you've been featured before",
			complete: hasPressCoverage(profileUser),
		},
		{
			id: "social",
			label: "Connect your social profiles",
			subtitle: "LinkedIn, Instagram or your website",
			complete: hasSocialProfiles(profileUser),
		},
		{
			id: "photo",
			label: "Upload a profile photo",
			subtitle: "Profiles with photos get more responses",
			complete: hasProfilePhoto(
				profileUser?.human_profile?.profile_image_url,
				profilePicURL,
			),
		},
	];
}

export function profileCompletionSummary(steps: ProfileCompletionStep[]) {
	const completedCount = steps.filter((step) => step.complete).length;

	return {
		completedCount,
		progressPercent: Math.round(
			(completedCount / PROFILE_COMPLETION_TOTAL) * 100,
		),
		isComplete: completedCount === PROFILE_COMPLETION_TOTAL,
	};
}
