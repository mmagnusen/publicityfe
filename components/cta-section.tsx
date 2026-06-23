import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";

export function CtaSection() {
	return (
		<section className="bg-[#0a0a0f] px-6 py-20 sm:py-24">
			<div className="mx-auto flex max-w-2xl flex-col items-center text-center">
				<Heading level={2} variant="section-inverse">
					Ready to Amplify Your Voice?
				</Heading>

				<Text variant="section-lead-inverse">
					Join thousands of creators and businesses who are building their
					authority and reaching millions through strategic visibility.
				</Text>

				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
					<Button href="#get-started" strVariant="white" textTransform="none">
						Get Started Free
					</Button>
					<Button
						href="#schedule-demo"
						strVariant="outlineInverse"
						textTransform="none"
					>
						Schedule a Demo
					</Button>
				</div>

				<Text variant="caption">Secure checkout &bull; Cancel anytime</Text>
			</div>
		</section>
	);
}
