import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import "./tiptap-variables.css";
import "./tiptap-keyframes.css";
import "./tiptap.css";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Spotlight — Promote yourself on interviews",
	description:
		"Connect with journalists, podcast hosts, and event organizers actively looking for experts like you.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
