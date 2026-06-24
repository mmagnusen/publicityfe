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
	children,
	icon,
	title,
}: {
	children: React.ReactNode;
	icon: string;
	title: string;
}) {
	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
				<span
					className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700"
					aria-hidden
				>
					<Icon horizontal path={icon} rotate={180} size={1.25} vertical />
				</span>
				<div className="min-w-0">
					<Heading level={2} variant="subsection">
						{title}
					</Heading>
					<div className="mt-2">{children}</div>
				</div>
			</div>
		</div>
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

	const supportEmail =
		process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@joindelphi.co";

	return (
		<div className="min-h-full bg-white font-sans">
			<Navigation isLoggedIn={isLoggedIn} />

			<main className="px-6 py-16 sm:py-24">
				<div className="mx-auto max-w-3xl">
					<Heading level={1} variant="page-lg">
						Contact us
					</Heading>
					<Text variant="page-subtitle" className="mt-3">
						Questions about ${TRADING_NAME}, your account, or an opportunity?
						We&apos;re here to help.
					</Text>

					<div className="mt-10 space-y-4">
						<ContactCard icon={mdiSend} title="Send a query">
							<p className="max-w-2xl text-[0.9375rem] leading-relaxed text-gray-600">
								Send us a message with your question and we&apos;ll reply by
								email as soon as we can.
							</p>
							<div className="mt-4">
								<Button
									onClick={() => setIsQueryModalOpen(true)}
									textTransform="none"
									type="button"
								>
									<span className="inline-flex items-center gap-2">
										<Icon
											horizontal
											path={mdiSend}
											rotate={180}
											size={0.85}
											vertical
										/>
										Send a message
									</span>
								</Button>
							</div>
						</ContactCard>

						<ContactCard icon={mdiChat} title="Live chat">
							<p className="max-w-2xl text-[0.9375rem] leading-relaxed text-gray-600">
								Chat with our support team for the fastest response on account,
								billing, and platform questions.
							</p>
							<div className="mt-4">
								<Button
									onClick={openLiveChat}
									textTransform="none"
									type="button"
								>
									<span className="inline-flex items-center gap-2">
										<Icon
											horizontal
											path={mdiChat}
											rotate={180}
											size={0.85}
											vertical
										/>
										Start live chat
									</span>
								</Button>
							</div>
						</ContactCard>

						<ContactCard icon={mdiEmailOutline} title="Email">
							<p className="max-w-2xl text-[0.9375rem] leading-relaxed text-gray-600">
								Prefer email? Reach us directly and we&apos;ll get back to you
								as soon as we can.
							</p>
							<p className="mt-4">
								<a
									className="text-sm font-semibold text-gray-900 underline underline-offset-2"
									href={`mailto:${supportEmail}`}
								>
									{supportEmail}
								</a>
							</p>
						</ContactCard>
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
