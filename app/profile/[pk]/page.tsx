import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { FounderProfileDetail } from "@/components/founder-profile-detail";
import { getAllProfileIds, getProfile } from "@/lib/profiles";

type ProfilePageProps = {
	params: Promise<{ pk: string }>;
};

export async function generateStaticParams() {
	return getAllProfileIds().map((pk) => ({ pk }));
}

export async function generateMetadata({
	params,
}: ProfilePageProps): Promise<Metadata> {
	const { pk } = await params;
	const profile = getProfile(pk);

	if (!profile) {
		return { title: "Profile not found — Spotlight" };
	}

	return {
		title: `${profile.name} — Spotlight`,
		description: profile.bio[0],
	};
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const { pk } = await params;
	const profile = getProfile(pk);

	if (!profile) {
		notFound();
	}

	return <FounderProfileDetail profile={profile} />;
}
