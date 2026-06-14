import Link from "next/link";

import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth-page-shell";
import Button from "@/components/Button";
import Text from "@/components/Text";

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
			<form className="space-y-5">
				<div className="grid gap-5 sm:grid-cols-2">
					<div>
						<label
							htmlFor="firstName"
							className="block text-sm font-medium text-black"
						>
							First name
						</label>
						<input
							id="firstName"
							name="firstName"
							type="text"
							autoComplete="given-name"
							required
							placeholder="Jane"
							className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black"
						/>
					</div>

					<div>
						<label
							htmlFor="lastName"
							className="block text-sm font-medium text-black"
						>
							Last name
						</label>
						<input
							id="lastName"
							name="lastName"
							type="text"
							autoComplete="family-name"
							required
							placeholder="Smith"
							className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-black"
					>
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						placeholder="you@example.com"
						className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black"
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-black"
					>
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
						required
						placeholder="Create a password"
						className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black"
					/>
				</div>

				<Button type="submit" isFullWidth textTransform="none">
					Create Account
				</Button>

				<Text variant="legal">
					By creating an account, you agree to our Terms of Service and Privacy
					Policy.
				</Text>
			</form>
		</AuthPageShell>
	);
}
