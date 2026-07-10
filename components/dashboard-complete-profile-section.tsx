"use client";

import Link from "next/link";
import {
	mdiAccountCircleOutline,
	mdiCheck,
	mdiImageOutline,
	mdiLinkVariant,
	mdiMicrophoneOutline,
} from "@mdi/js";
import Icon from "@mdi/react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { usePublicUser } from "@hooks/usePublicUser";

import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { cn } from "@/lib/cn";
import {
	getProfileCompletionSteps,
	PROFILE_COMPLETION_TOTAL,
	type ProfileCompletionStep,
	type ProfileCompletionStepId,
	profileCompletionSummary,
} from "@/lib/profileCompletion";
import { profilePagePath } from "@/lib/publicUser";

const incompleteStepIcons: Record<ProfileCompletionStepId, string> = {
	bio: mdiAccountCircleOutline,
	press: mdiMicrophoneOutline,
	social: mdiLinkVariant,
	photo: mdiImageOutline,
};

function CompletedStepRow({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-3 py-4">
			<span
				className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600"
				aria-hidden
			>
				<Icon horizontal path={mdiCheck} rotate={180} size={0.75} vertical />
			</span>
			<p className="text-sm text-gray-400 line-through">{label}</p>
		</div>
	);
}

function IncompleteStepRow({
	href,
	label,
	subtitle,
	stepId,
}: {
	href: string;
	label: string;
	stepId: ProfileCompletionStepId;
	subtitle: string;
}) {
	return (
		<div className="flex items-center gap-3 py-4">
			<span
				className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500"
				aria-hidden
			>
				<Icon
					horizontal
					path={incompleteStepIcons[stepId]}
					rotate={180}
					size={0.75}
					vertical
				/>
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-gray-900">{label}</p>
				<p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
			</div>
			<Link
				className="shrink-0 text-sm font-semibold text-violet-700 hover:text-violet-800"
				href={href}
			>
				Add now →
			</Link>
		</div>
	);
}

function ProfileCompletionStepRow({
	profileHref,
	step,
}: {
	profileHref: string;
	step: ProfileCompletionStep;
}) {
	if (step.complete) {
		return <CompletedStepRow label={step.label} />;
	}

	if (!step.subtitle) {
		return null;
	}

	return (
		<IncompleteStepRow
			href={profileHref}
			label={step.label}
			stepId={step.id}
			subtitle={step.subtitle}
		/>
	);
}

type DashboardCompleteProfileSectionProps = {
	username: string;
};

export function DashboardCompleteProfileSection({
	username,
}: DashboardCompleteProfileSectionProps) {
	const { profilePicURL } = useAuthenticatedUser();
	const { data: profileUser, isLoading } = usePublicUser(username);
	const profileHref = profilePagePath(username);

	const steps = getProfileCompletionSteps({
		profileUser,
		profilePicURL,
	});
	const { completedCount, isComplete, progressPercent } =
		profileCompletionSummary(steps);

	if (!isLoading && isComplete) {
		return null;
	}

	return (
		<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
			<div className="flex items-start justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<span
						className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"
						aria-hidden
					>
						<Icon
							horizontal
							path={mdiAccountCircleOutline}
							rotate={180}
							size={0.9}
							vertical
						/>
					</span>
					<Heading level={2} variant="subsection" className="text-violet-900">
						Complete your profile
					</Heading>
				</div>
				<span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
					{isLoading
						? "…"
						: `${completedCount} of ${PROFILE_COMPLETION_TOTAL} done`}
				</span>
			</div>

			<Text variant="card-body" className="mt-3">
				A complete profile means better opportunities. Journalists and hosts are
				more likely to select you when they can see the full picture.
			</Text>

			<div
				className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={isLoading ? 0 : progressPercent}
				aria-label="Profile completion progress"
			>
				<div
					className={cn(
						"h-full rounded-full bg-violet-600 transition-[width] duration-300",
						isLoading && "w-0",
					)}
					style={isLoading ? undefined : { width: `${progressPercent}%` }}
				/>
			</div>

			<div className="mt-2 divide-y divide-gray-200">
				{steps.map((step) => (
					<ProfileCompletionStepRow
						key={step.id}
						profileHref={profileHref}
						step={step}
					/>
				))}
			</div>
		</div>
	);
}
