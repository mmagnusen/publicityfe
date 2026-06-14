"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import useErrorReport from "@hooks/useErrorReport";
import { isLikelyNetworkError } from "@util/errorReporting";
import { parseLoginApiError } from "@util/loginApiErrors";

import Button from "@/components/Button";
import Text from "@/components/Text";

export function LoginForm() {
	const router = useRouter();
	const { authenticationChecked, funcLogin, isLoggedIn } =
		useAuthenticatedUser();
	const { reportError } = useErrorReport({
		functionNamePrefix: "LoginForm",
	});
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (authenticationChecked && isLoggedIn) {
			router.replace("/dashboard");
		}
	}, [authenticationChecked, isLoggedIn, router]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			await funcLogin(email, password);
			router.replace("/dashboard");
		} catch (submitError: unknown) {
			const { formMessage } = parseLoginApiError(submitError);
			setError(
				formMessage ??
					(isLikelyNetworkError(submitError)
						? "Unable to reach the server. Check your connection and try again."
						: "Unable to sign in. Please check your details and try again."),
			);
			reportError(submitError, "login_submit");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!authenticationChecked) {
		return <Text variant="center-sm">Checking your session…</Text>;
	}

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			{error ? (
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			) : null}

			<div>
				<label htmlFor="email" className="block text-sm font-medium text-black">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					placeholder="you@example.com"
					className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black"
				/>
			</div>

			<div>
				<div className="flex items-center justify-between">
					<label
						htmlFor="password"
						className="block text-sm font-medium text-black"
					>
						Password
					</label>
					<Link
						href="#"
						className="text-sm text-gray-500 transition-colors hover:text-black"
					>
						Forgot password?
					</Link>
				</div>
				<input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					placeholder="Enter your password"
					className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black"
				/>
			</div>

			<Button
				type="submit"
				bLoading={isSubmitting}
				isFullWidth
				textTransform="none"
			>
				{isSubmitting ? "Signing in…" : "Sign In"}
			</Button>
		</form>
	);
}
