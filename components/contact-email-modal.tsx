"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { mdiCheck, mdiContentCopy } from "@mdi/js";
import Icon from "@mdi/react";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { cn } from "@/lib/cn";

type Props = {
	contactName: string;
	description: string;
	email: string | null;
	isOpen: boolean;
	onClose: () => void;
	title: string;
	unavailableMessage?: string;
};

export function ContactEmailModal({
	contactName,
	description,
	email,
	isOpen,
	onClose,
	title,
	unavailableMessage = "Email address is not available.",
}: Props) {
	const [copied, setCopied] = useState(false);
	const copiedTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (copiedTimeoutRef.current != null) {
				window.clearTimeout(copiedTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!isOpen) {
			setCopied(false);
			if (copiedTimeoutRef.current != null) {
				window.clearTimeout(copiedTimeoutRef.current);
				copiedTimeoutRef.current = null;
			}
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

	const copyEmail = async () => {
		if (!email) {
			return;
		}

		try {
			await navigator.clipboard.writeText(email);
			setCopied(true);
			if (copiedTimeoutRef.current != null) {
				window.clearTimeout(copiedTimeoutRef.current);
			}
			copiedTimeoutRef.current = window.setTimeout(() => {
				setCopied(false);
				copiedTimeoutRef.current = null;
			}, 2000);
			toast.success("Email address copied");
		} catch {
			toast.error("Could not copy to clipboard");
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				aria-label="Close contact dialog"
				className="absolute inset-0 bg-black/40"
				onClick={onClose}
				type="button"
			/>

			<div
				aria-labelledby="contact-email-modal-title"
				aria-modal="true"
				className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
				role="dialog"
			>
				<div className="flex items-start justify-between gap-4">
					<Heading
						level={2}
						id="contact-email-modal-title"
						variant="subsection"
					>
						{title}
					</Heading>
					<Button
						onClick={onClose}
						size="small"
						strVariant="transparentWithBorder"
						textTransform="none"
						type="button"
					>
						Close
					</Button>
				</div>

				<Text variant="card-body" className="mt-2">
					{description}
				</Text>

				{email ? (
					<div className="mt-6">
						<p className="text-sm font-semibold text-gray-500">Email address</p>
						<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
							<input
								readOnly
								aria-label={`${contactName} email address`}
								className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
								type="text"
								value={email}
							/>
							<Button onClick={copyEmail} textTransform="none" type="button">
								<span
									className={cn(
										"inline-flex items-center gap-2 transition-colors duration-300",
										copied && "text-green-600",
									)}
								>
									<span
										className={cn(
											"inline-flex transition-transform duration-300 ease-out",
											copied ? "scale-125 rotate-6" : "scale-100 rotate-0",
										)}
									>
										<Icon
											horizontal
											path={copied ? mdiCheck : mdiContentCopy}
											rotate={180}
											size={0.8}
											vertical
										/>
									</span>
									{copied ? "Copied!" : "Copy email"}
								</span>
							</Button>
						</div>
					</div>
				) : (
					<div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{unavailableMessage}
					</div>
				)}
			</div>
		</div>
	);
}
