"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { EditOpportunityContent } from "./EditOpportunityContent";

type EditOpportunityModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSaved?: () => void;
	opportunityPk: number;
};

export function EditOpportunityModal({
	isOpen,
	onClose,
	onSaved,
	opportunityPk,
}: EditOpportunityModalProps) {
	const router = useRouter();

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	const handleSaved = async () => {
		toast.success("Opportunity updated.");
		onSaved?.();
		onClose();
	};

	const handleDeleted = async () => {
		toast.success("Opportunity deleted.");
		onClose();
		await router.push("/admin/opportunity");
	};

	return (
		<div
			aria-labelledby="edit-opportunity-title"
			aria-modal="true"
			className="fixed inset-0 z-50 flex flex-col bg-white"
			role="dialog"
		>
			<header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
				<div>
					<Heading id="edit-opportunity-title" level={2} variant="subsection">
						Edit opportunity
					</Heading>
					<Text variant="caption" className="mt-1">
						Update title and descriptions for this opportunity.
					</Text>
				</div>
				<Button
					onClick={onClose}
					strVariant="transparentWithBorder"
					textTransform="none"
					type="button"
				>
					Close
				</Button>
			</header>

			<div className="flex-1 overflow-y-auto px-6 py-8">
				<div className="mx-auto max-w-2xl">
					<EditOpportunityContent
						onDeleteSuccess={handleDeleted}
						onSubmitSuccess={handleSaved}
						opportunityPk={opportunityPk}
					/>
				</div>
			</div>
		</div>
	);
}
