import {
	mdiBullhornOutline,
	mdiClockOutline,
	mdiEmailOutline,
	mdiInstagram,
	mdiLinkedin,
} from "@mdi/js";
import Icon from "@mdi/react";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";
import { cn } from "@/lib/cn";

type ShareTagProps = {
	className?: string;
	icon: string;
	iconClassName: string;
	label: string;
};

function ShareTag({ className, icon, iconClassName, label }: ShareTagProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700",
				className,
			)}
		>
			<span className={cn("inline-flex shrink-0", iconClassName)} aria-hidden>
				<Icon horizontal path={icon} rotate={180} size={0.75} vertical />
			</span>
			{label}
		</div>
	);
}

export function DashboardAddOpportunitySection() {
	return (
		<div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
			<div className="flex items-center gap-3">
				<span
					className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"
					aria-hidden
				>
					<Icon
						horizontal
						path={mdiBullhornOutline}
						rotate={180}
						size={0.9}
						vertical
					/>
				</span>
				<Heading level={2} variant="subsection">
					Post an opportunity
				</Heading>
			</div>
			<Text variant="card-body" className="mt-3">
				Looking for an expert to quote, a podcast guest, or a panel speaker?
				Post your opportunity for free and let the right people come to you.
			</Text>
			<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
				<ShareTag
					icon={mdiLinkedin}
					iconClassName="text-blue-600"
					label="Shared on LinkedIn"
				/>
				<ShareTag
					icon={mdiInstagram}
					iconClassName="text-pink-600"
					label="Shared on Instagram"
				/>
				<ShareTag
					className="sm:col-span-2"
					icon={mdiEmailOutline}
					iconClassName="text-green-600"
					label="Sent to all members in our daily bulletin"
				/>
			</div>
			<div className="mt-5 border-t border-gray-200 pt-4">
				<div className="flex items-start gap-2 text-sm text-gray-500">
					<span
						className="inline-flex shrink-0 pt-0.5 text-gray-400"
						aria-hidden
					>
						<Icon
							horizontal
							path={mdiClockOutline}
							rotate={180}
							size={0.667}
							vertical
						/>
					</span>
					<span>
						Takes less than 5 minutes to post. We manually review every listing
						so members know your opportunity is genuine.
					</span>
				</div>
				<Button
					className="mt-4"
					href="/create-opportunity"
					isFullWidth
					textTransform="none"
				>
					Post an opportunity →
				</Button>
			</div>
		</div>
	);
}
