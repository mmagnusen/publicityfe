import Link from "next/link";

import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth-page-shell";
import { LoginForm } from "@/components/login-form";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Sign In- ${TRADING_NAME}`,
	description: `Sign in to your ${TRADING_NAME} account.`,
};

export default function LoginPage() {
	return (
		<AuthPageShell
			title="Welcome back"
			description="Sign in to manage your profile and opportunities."
			footer={
				<>
					Don&apos;t have an account?{" "}
					<Link
						href="/register"
						className="font-medium text-black hover:underline"
					>
						Create one
					</Link>
				</>
			}
		>
			<LoginForm />
		</AuthPageShell>
	);
}
