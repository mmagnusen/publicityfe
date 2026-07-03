import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

export function CtaSection() {
	return (
		<section className="bg-[#0a0a0f] px-6 py-20 sm:py-24">
			<div className="mx-auto flex max-w-2xl flex-col items-center text-center">
				<Heading level={2} variant="section-inverse">
					Ready to Get Featured?
				</Heading>

				<Text variant="section-lead-inverse">
					Early access is now open. Whether you're a founder, creative or
					industry expert - join founding members and start getting in front of
					the journalists, podcast hosts and event organisers who are looking
					for people like you.
				</Text>

				<Button
					href="/register"
					strVariant="white"
					textTransform="none"
					className="mt-8"
				>
					Get Started Free
				</Button>

				{isPricingReleased ? (
					<Text variant="caption">Secure checkout &bull; Cancel anytime</Text>
				) : null}
			</div>
		</section>
	);
}
