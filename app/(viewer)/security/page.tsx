import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { LEGAL_LAST_UPDATED, PageSection, StaticPage } from "@/features/site-pages";

export const metadata: Metadata = {
  title: "Report Security Issues",
  description: `How to responsibly report a security vulnerability in ${siteConfig.name}.`,
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  const email = siteConfig.supportEmail;
  const mailto = `mailto:${email}?subject=${encodeURIComponent("Security report")}`;

  return (
    <StaticPage
      eyebrow="Security"
      title="Report a security issue"
      description="We take the security of your QR codes and data seriously and appreciate responsible disclosure."
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <PageSection title="How to report">
        <p>
          Email <a href={mailto}>{email}</a> with the subject &ldquo;Security report&rdquo;. Please include:
        </p>
        <ul>
          <li>A description of the issue and its potential impact</li>
          <li>Step-by-step instructions to reproduce it, including affected URLs or endpoints</li>
          <li>Any proof-of-concept code, screenshots or request/response samples</li>
          <li>How you would like to be credited, if at all</li>
        </ul>
      </PageSection>

      <PageSection title="What to expect">
        <ul>
          <li>We acknowledge reports within 3 business days.</li>
          <li>We keep you updated while we investigate and fix the issue.</li>
          <li>We let you know when it&apos;s resolved and, with your permission, credit you.</li>
        </ul>
      </PageSection>

      <PageSection title="Guidelines">
        <p>When researching, please:</p>
        <ul>
          <li>Only test against accounts and organizations you own or have permission to use</li>
          <li>Never access, change or delete other users&apos; data, QR codes or scan history</li>
          <li>Avoid denial-of-service, spam, social engineering and physical attacks</li>
          <li>Give us reasonable time to fix the issue before disclosing it publicly</li>
        </ul>
        <p>
          We won&apos;t take legal action against research done in good faith that follows these guidelines.
        </p>
      </PageSection>

      <PageSection title="Out of scope">
        <ul>
          <li>Reports from automated scanners without a demonstrated impact</li>
          <li>Missing security headers or best practices with no exploitable issue</li>
          <li>Destinations that customers choose for their own QR codes — report abusive links separately to the same address</li>
        </ul>
      </PageSection>
    </StaticPage>
  );
}
