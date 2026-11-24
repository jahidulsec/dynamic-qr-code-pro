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
import { CookieConsentBanner } from "@/features/site-pages";

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
      <CookieConsentBanner />
    </>
  );
}
