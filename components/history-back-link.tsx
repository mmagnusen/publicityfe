"use client";

import { useRouter } from "next/navigation";

type HistoryBackLinkProps = {
	children: React.ReactNode;
	className?: string;
	fallbackHref?: string;
};

export function HistoryBackLink({
	children,
	className,
	fallbackHref = "/",
}: HistoryBackLinkProps) {
	const router = useRouter();

	return (
		<button
			type="button"
			className={className}
			onClick={() => {
				if (typeof window !== "undefined" && window.history.length > 1) {
					router.back();
					return;
				}

				router.push(fallbackHref);
			}}
		>
			{children}
		</button>
	);
}
