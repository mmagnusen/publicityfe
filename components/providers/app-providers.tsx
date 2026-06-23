"use client";

import { type ReactNode, useEffect } from "react";
import { ToastContainer } from "react-toastify";

import { AuthenticatedUserContextProvider } from "@hooks/useAuthenticatedUser";
import "react-toastify/dist/ReactToastify.css";
import { LogSnagProvider } from "@logsnag/next";
import { isPosthogConfigured } from "@util/posthogProductErrorReporting";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

function PosthogInit() {
	useEffect(() => {
		if (!isPosthogConfigured()) {
			return;
		}

		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			person_profiles: "identified_only",
		});
	}, []);

	return null;
}

function LogSnagWrapper({ children }: { children: ReactNode }) {
	const project = process.env.NEXT_PUBLIC_LOGSNAG_PROJECT;
	const token = process.env.NEXT_PUBLIC_LOGSNAG_TOKEN;

	if (!project || !token) {
		return children;
	}

	return (
		<LogSnagProvider project={project} token={token}>
			{children}
		</LogSnagProvider>
	);
}

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<PostHogProvider client={posthog}>
			<PosthogInit />
			<LogSnagWrapper>
				<AuthenticatedUserContextProvider>
					{children}
					<ToastContainer />
				</AuthenticatedUserContextProvider>
			</LogSnagWrapper>
		</PostHogProvider>
	);
}
