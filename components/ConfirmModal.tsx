"use client";

import { useEffect } from "react";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";

type Props = {
	confirmLabel?: string;
	isLoading?: boolean;
	isOpen: boolean;
	message: string;
	onCancel: () => void;
	onConfirm: () => void;
	title: string;
};

export function ConfirmModal({
	confirmLabel = "Confirm",
	isLoading = false,
	isOpen,
	message,
	onCancel,
	onConfirm,
	title,
}: Props) {
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !isLoading) {
				onCancel();
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isLoading, isOpen, onCancel]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				aria-label="Close confirmation dialog"
				className="absolute inset-0 bg-black/40"
				disabled={isLoading}
				onClick={onCancel}
				type="button"
			/>

			<div
				aria-labelledby="confirm-modal-title"
				aria-modal="true"
				className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
				role="dialog"
			>
				<Heading id="confirm-modal-title" level={2} variant="subsection">
					{title}
				</Heading>
				<Text variant="card-body" className="mt-2">
					{message}
				</Text>

				<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<Button
						isDisabled={isLoading}
						onClick={onCancel}
						strVariant="transparentWithBorder"
						textTransform="none"
						type="button"
					>
						Cancel
					</Button>
					<Button
						bLoading={isLoading}
						isDisabled={isLoading}
						onClick={onConfirm}
						textTransform="none"
						type="button"
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
