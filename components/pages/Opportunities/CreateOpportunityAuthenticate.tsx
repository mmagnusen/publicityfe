"use client";

import { useState } from "react";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth-page-shell";
import Heading from "@/components/Heading";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

export const CREATE_OPPORTUNITY_PATH = "/create-opportunity";

export const CREATE_OPPORTUNITY_AUTHENTICATE_PATH = `${CREATE_OPPORTUNITY_PATH}/authenticate`;

type CreateOpportunityAuthenticateProps = {
	onSuccess: () => void;
};

function LoginPrompt({ onShowLogin }: { onShowLogin: () => void }) {
	return (
		<p className="text-center text-sm text-gray-500">
			Already have an account?{" "}
			<button
				className="font-medium text-black hover:underline"
				onClick={onShowLogin}
				type="button"
			>
				Sign in
			</button>
		</p>
	);
}

function RegisterPrompt({ onShowRegister }: { onShowRegister: () => void }) {
	return (
		<p className="text-center text-sm text-gray-500">
			Don&apos;t have an account?{" "}
			<button
				className="font-medium text-black hover:underline"
				onClick={onShowRegister}
				type="button"
			>
				Create one
			</button>
		</p>
	);
}

export function CreateOpportunityAuthenticate({
	onSuccess,
}: CreateOpportunityAuthenticateProps) {
	const [view, setView] = useState<"register" | "login">("register");

	const more = "100% for journalists or anyone posting an opportunity.";

	return (
		<AuthPageShell
			title={view === "register" ? "Create your account" : "Welcome back"}
			description={
				view === "register"
					? `Sign up to post a media opportunity on ${TRADING_NAME}. ${more}`
					: `Sign in to continue posting your opportunity. ${more}`
			}
			footer={
				<Link href="/" className="font-medium text-black hover:underline">
					Back to home
				</Link>
			}
		>
			<div className="space-y-6">
				<div>
					<Heading level={2} variant="subsection">
						{view === "register" ? "Register" : "Sign in"}
					</Heading>
					<Text variant="card-body" className="mt-1">
						{view === "register"
							? "Get started by creating an account."
							: "Please sign in to continue."}
					</Text>
				</div>

				{view === "register" ? (
					<>
						<RegisterForm disableRedirect onSuccess={onSuccess} />
						<LoginPrompt onShowLogin={() => setView("login")} />
					</>
				) : (
					<>
						<LoginForm disableRedirect onSuccess={onSuccess} />
						<RegisterPrompt onShowRegister={() => setView("register")} />
					</>
				)}
			</div>
		</AuthPageShell>
	);
}
