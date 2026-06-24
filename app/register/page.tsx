import Link from "next/link";

import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth-page-shell";
import { RegisterForm } from "@/components/register-form";
import { TRADING_NAME } from "@/constants/tradingName";

export const metadata: Metadata = {
	title: `Create Account- ${TRADING_NAME}`,
	description: `Create your ${TRADING_NAME} account and start landing opportunities.`,
};

export default function RegisterPage() {
	return (
		<AuthPageShell
			title="Create your account"
			description="Start free and get matched with media opportunities."
			footer={
				<>
					Already have an account?{" "}
					<Link
						href="/login"
						className="font-medium text-black hover:underline"
					>
						Sign in
					</Link>
				</>
			}
		>
			<RegisterForm />
		</AuthPageShell>
	);
}
