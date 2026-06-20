"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import type { ProfileFormValues } from "@/lib/profileForm";
import { ProfileEditForm } from "./ProfileEditForm";

type ProfilePageEditButtonProps = {
	profileUsername: string;
	initialValues: ProfileFormValues;
	onProfileSaved?: (values: ProfileFormValues) => void;
};

export function ProfilePageEditButton({
	profileUsername,
	initialValues,
	onProfileSaved,
}: ProfilePageEditButtonProps) {
	const router = useRouter();
	const { authenticatedUser } = useAuthenticatedUser();
	const [isOpen, setIsOpen] = useState(false);

	const isOwner =
		Boolean(authenticatedUser?.username?.trim()) &&
		authenticatedUser?.username?.trim() === profileUsername.trim();

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen]);

	if (!isOwner) {
		return null;
	}

	return (
		<>
			<Button
				type="button"
				strVariant="transparentWithBorder"
				textTransform="none"
				onClick={() => setIsOpen(true)}
			>
				Edit profile
			</Button>

			{isOpen ? (
				<div
					className="fixed inset-0 z-50 flex flex-col bg-white"
					role="dialog"
					aria-modal="true"
					aria-labelledby="profile-edit-title"
				>
					<header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
						<Heading level={2} id="profile-edit-title">
							Edit profile
						</Heading>
						<Button
							type="button"
							strVariant="transparentWithBorder"
							textTransform="none"
							onClick={() => setIsOpen(false)}
						>
							Close
						</Button>
					</header>

					<div className="flex-1 overflow-y-auto px-6 py-8">
						<div className="mx-auto max-w-2xl">
							<ProfileEditForm
								initialValues={initialValues}
								profileUsername={profileUsername}
								onCancel={() => setIsOpen(false)}
								onSuccess={(values) => {
									setIsOpen(false);
									onProfileSaved?.(values);
									router.refresh();
								}}
							/>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
