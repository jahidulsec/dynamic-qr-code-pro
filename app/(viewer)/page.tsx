import type { Metadata } from "next";

import {
  CtaSection,
  FaqSection,
  FeaturesSection,
  HeroSection,
  HomeJsonLd,
  HowItWorksSection,
  PricingSection,
} from "@/features/home";

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
