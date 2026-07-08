import Heading from "@/components/Heading";
import { OpportunitiesListMockup } from "@/components/opportunities-list-mockup";
import Text from "@/components/Text";
import { TRADING_NAME } from "@/constants/tradingName";

const brandName = TRADING_NAME || "Get Featured";

export function OpportunitiesCommunitySection() {
	return (
		<section className="bg-gray-50 px-6 py-20 sm:py-24">
			<div className="mx-auto max-w-4xl text-center">
				<Heading level={2}>A platform built on trust</Heading>
				<Text variant="section-lead-relaxed" className="mx-auto mt-4 max-w-2xl">
					Every opportunity on {brandName} comes directly from journalists,
					editors, podcast hosts and event organisers who are genuinely looking
					for contributors. No cold outreach, no guesswork — just real
					opportunities from real media.
				</Text>
			</div>

			<div className="mx-auto mt-12 max-w-6xl sm:mt-14">
				<OpportunitiesListMockup />
			</div>
		</section>
	);
}
