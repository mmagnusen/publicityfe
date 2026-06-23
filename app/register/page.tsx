import Link from "next/link";

import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth-page-shell";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
	title: "Create Account — Spotlight",
	description: "Create your Spotlight account and start landing opportunities.",
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
