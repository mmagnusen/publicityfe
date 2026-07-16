import Image from "next/image";
import Link from "next/link";

import { TRADING_NAME } from "@/constants/tradingName";

export function LogoLink() {
	return (
		<Link href="/" className="flex items-center" aria-label={TRADING_NAME}>
			<Image
				src="/logo.png"
				alt={TRADING_NAME}
				width={1024}
				height={512}
				priority
				className="h-9 w-auto"
			/>
		</Link>
	);
}
