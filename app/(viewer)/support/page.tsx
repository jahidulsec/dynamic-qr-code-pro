import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { PageSection, StaticPage } from "@/features/site-pages";

export const metadata: Metadata = {
  title: "Support",
  description: `Get help with ${siteConfig.name}: contact support, check system status or report a problem.`,
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  const email = siteConfig.supportEmail;

  return (
    <StaticPage
      eyebrow="Support"
      title="How can we help?"
      description="Questions about your QR codes, billing or your team workspace — we're here to help."
    >
      <PageSection title="Contact support">
        <p>
          Email us at <a href={`mailto:${email}`}>{email}</a>. We reply to most requests within one business day.
        </p>
        <p>To help us answer faster, include:</p>
        <ul>
          <li>Your organization name and the email you sign in with</li>
          <li>The QR code ID or short link involved, if any</li>
          <li>What you expected to happen and what happened instead, with screenshots if possible</li>
        </ul>
      </PageSection>

      <PageSection title="Something not working?">
        <p>
          Check the <Link href="/status">system status page</Link> first — if there&apos;s an ongoing incident,
          it&apos;s shown there.
        </p>
      </PageSection>

      <PageSection title="Billing and plans">
        <p>
          Organization owners can see their current plan and limits under <strong>Settings → Billing</strong>. For
          plan changes, invoices or refunds, email <a href={`mailto:${email}?subject=Billing`}>{email}</a> with the
          subject &ldquo;Billing&rdquo;.
        </p>
      </PageSection>

      <PageSection title="Security issues">
        <p>
          Found a vulnerability? Please don&apos;t file it as a normal support request — follow our{" "}
          <Link href="/security">security disclosure process</Link> instead.
        </p>
      </PageSection>
    </StaticPage>
  );
}
