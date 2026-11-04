import type { Metadata } from "next";

import { CtaSection } from "@/features/home/components/cta-section";
import { FaqSection } from "@/features/home/components/faq-section";
import { FeaturesSection } from "@/features/home/components/features-section";
import { HomeJsonLd } from "@/features/home/components/home-json-ld";
import { HeroSection } from "@/features/home/components/hero-section";
import { HowItWorksSection } from "@/features/home/components/how-it-works-section";
import { PricingSection } from "@/features/home/components/pricing-section";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
