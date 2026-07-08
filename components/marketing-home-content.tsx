"use client";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import { CreatorsSection } from "@/components/creators-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/Footer";
import { FaqsSection } from "@/components/faqs-section";
import { FeaturesSection } from "@/components/features-section";
import { GallerySection } from "@/components/gallery-section";
import { HeroSection } from "@/components/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { Navigation } from "@/components/Navigation";
import { OpportunitiesCommunitySection } from "@/components/opportunities-community-section";
import { PricingSection } from "@/components/pricing-section";
import { TrustedBySection } from "@/components/trusted-by-section";

const isPricingReleased =
	String(process.env.NEXT_PUBLIC_PRICING_RELEASED) === "true";

export function MarketingHomeContent() {
	const { isLoggedIn } = useAuthenticatedUser();

	return (
		<div className="min-h-full bg-white font-sans">
			<Navigation isLoggedIn={isLoggedIn} />
			<HeroSection />
			<TrustedBySection />
			<OpportunitiesCommunitySection />
			<GallerySection />
			<HowItWorksSection />
			<CreatorsSection />
			<FeaturesSection />
			{isPricingReleased ? <PricingSection /> : null}
			<FaqsSection />
			<CtaSection />
			<Footer />
		</div>
	);
}
