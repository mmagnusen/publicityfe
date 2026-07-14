import { Anton, Geist_Mono, Inter } from "next/font/google";

import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { TRADING_NAME } from "@/constants/tradingName";
import "./tiptap-variables.css";
import "./tiptap-keyframes.css";
import "./tiptap.css";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const anton = Anton({
	variable: "--font-anton",
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: `${TRADING_NAME}- Get featured on interviews`,
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
			className={`${inter.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
