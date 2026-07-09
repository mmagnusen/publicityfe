"use client";

import { useState } from "react";
import { Crisp } from "crisp-sdk-web";
import { mdiChat, mdiEmailOutline, mdiSend } from "@mdi/js";
import Icon from "@mdi/react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { useCrispChatWidget } from "@hooks/useCrispChatWidget";

import Button from "@/components/Button";
import { ContactQueryModal } from "@/components/contact-query-modal";
import { Footer } from "@/components/Footer";
import Heading from "@/components/Heading";
import { Navigation } from "@/components/Navigation";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

function ContactCard({
	action,
	description,
	icon,
	title,
}: {
	action: React.ReactNode;
	description: string;
	icon: string;
	title: string;
}) {
	return (
		<article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
			<span
				className="inline-flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700"
				aria-hidden
			>
				<Icon horizontal path={icon} rotate={180} size={1.1} vertical />
			</span>
			<Heading level={2} variant="subsection" className="mt-4">
				{title}
			</Heading>
			<Text variant="card-body" className="mt-2 max-w-xl">
				{description}
			</Text>
			<div className="mt-5">{action}</div>
		</article>
	);
}

export function ContactUsContent() {
	useCrispChatWidget();
	const { isLoggedIn } = useAuthenticatedUser();
	const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

	const openLiveChat = () => {
		if (process.env.NEXT_PUBLIC_CRISP_WEBSITE) {
			Crisp.chat.open();
		}
	};

	const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

	return (
		<div className="min-h-full bg-white font-sans">
			<Navigation isLoggedIn={isLoggedIn} />

			<main className="px-6 py-16 sm:py-24">
				<div className="mx-auto max-w-3xl">
					<Heading level={1} variant="page-lg">
						Contact us
					</Heading>
					<Text variant="page-subtitle" className="mt-3">
						Questions about {TRADING_NAME}, your account, or an opportunity?
						We&apos;re here to help.
					</Text>

					<div className="mt-10 space-y-4">
						<ContactCard
							description="Send us a message with your question and we'll reply by email as soon as we can."
							icon={mdiSend}
							title="Send a query"
							action={
								<Button
									onClick={() => setIsQueryModalOpen(true)}
									textTransform="none"
									type="button"
								>
									Send a message
								</Button>
							}
						/>

						<ContactCard
							description="Chat with our support team for the fastest response on account, billing, and platform questions."
							icon={mdiChat}
							title="Live chat"
							action={
								<Button
									onClick={openLiveChat}
									textTransform="none"
									type="button"
								>
									Start live chat
								</Button>
							}
						/>

						{supportEmail ? (
							<ContactCard
								description="Prefer email? Reach us directly and we'll get back to you as soon as we can."
								icon={mdiEmailOutline}
								title="Email"
								action={
									<Button
										href={`mailto:${supportEmail}`}
										strVariant="transparentWithBorder"
										textTransform="none"
									>
										{supportEmail}
									</Button>
								}
							/>
						) : null}
					</div>
				</div>
			</main>

			<Footer />

			<ContactQueryModal
				isOpen={isQueryModalOpen}
				onClose={() => setIsQueryModalOpen(false)}
			/>
		</div>
	);
}
