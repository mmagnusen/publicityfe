"use client";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

import { CreatorsSection } from "@/components/creators-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/Footer";
import { FeaturesSection } from "@/components/features-section";
import { GallerySection } from "@/components/gallery-section";
import { HeroSection } from "@/components/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { Navigation } from "@/components/Navigation";
import { PricingSection } from "@/components/pricing-section";
import { TrustedBySection } from "@/components/trusted-by-section";

export function MarketingHomeContent() {
	const { isLoggedIn } = useAuthenticatedUser();

	return (
		<div className="min-h-full bg-white font-sans">
			<Navigation isLoggedIn={isLoggedIn} />
			<HeroSection />
			<TrustedBySection />
			<GallerySection />
			<FeaturesSection />
			<HowItWorksSection />
			<CreatorsSection />
			<PricingSection />
			<CtaSection />
			<Footer />
		</div>
	);
}
