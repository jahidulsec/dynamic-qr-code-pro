import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { COMPANY_NAME, LEGAL_LAST_UPDATED, PageSection, StaticPage } from "@/features/site-pages";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms that govern your use of ${siteConfig.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const email = siteConfig.supportEmail;

  return (
    <StaticPage eyebrow="Legal" title="Terms of Use" lastUpdated={LEGAL_LAST_UPDATED}>
      <PageSection title="1. Agreement">
        <p>
          These Terms of Use govern your access to and use of {siteConfig.name} (the &ldquo;Service&rdquo;),
          provided by {COMPANY_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using the
          Service you agree to these terms. If you use the Service on behalf of an organization, you confirm you
          are authorized to accept these terms for it.
        </p>
      </PageSection>

      <PageSection title="2. Accounts and organizations">
        <ul>
          <li>You must provide accurate information and keep your sign-in credentials secure.</li>
          <li>You are responsible for all activity in your account and in organizations you own.</li>
          <li>Organization owners and admins control who has access and what members can do.</li>
          <li>New organizations may need to be approved before they can use the Service.</li>
        </ul>
      </PageSection>

      <PageSection title="3. Dynamic QR codes">
        <p>
          Dynamic QR codes point to short links hosted by us, which redirect to destinations you choose. Codes
          only keep redirecting while your organization has an active account and the code is active and within
          your plan&apos;s limits. Paused, deleted or over-limit codes may stop redirecting.
        </p>
      </PageSection>

      <PageSection title="4. Acceptable use">
        <p>You may not use the Service to:</p>
        <ul>
          <li>Link to malware, phishing, scams or other deceptive or illegal content</li>
          <li>Infringe anyone&apos;s intellectual property, privacy or other rights</li>
          <li>Send spam or harass people</li>
          <li>Probe, overload or interfere with the Service, or access it by unauthorized means</li>
          <li>Resell or sublicense the Service without our written permission</li>
        </ul>
        <p>
          We may pause codes, suspend organizations or ban accounts that break these rules, with or without
          notice.
        </p>
      </PageSection>

      <PageSection title="5. Plans and payment">
        <p>
          Features and limits depend on your organization&apos;s plan. Paid plans are billed in advance and are
          non-refundable except where required by law. We may change plans and prices with reasonable notice;
          changes apply from your next billing period.
        </p>
      </PageSection>

      <PageSection title="6. Your content">
        <p>
          You keep ownership of the content you add, such as destination URLs, names, logos and tags. You grant us
          the rights needed to host, process and display it to operate the Service. You are responsible for making
          sure you have the right to use it.
        </p>
      </PageSection>

      <PageSection title="7. Privacy">
        <p>
          Our <Link href="/privacy">Privacy Policy</Link> explains what we collect, including scan analytics, and
          how we use it.
        </p>
      </PageSection>

      <PageSection title="8. Availability and changes">
        <p>
          We work to keep the Service available but don&apos;t guarantee it will be uninterrupted or error-free.
          Current status is shown on our <Link href="/status">status page</Link>. We may change or discontinue
          features, and will give reasonable notice of changes that materially affect you.
        </p>
      </PageSection>

      <PageSection title="9. Disclaimers and liability">
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the extent permitted by
          law, we disclaim all implied warranties, and our total liability for any claim relating to the Service
          is limited to the amount you paid us in the 12 months before the claim. We are not liable for indirect,
          incidental or consequential damages, including lost profits or data.
        </p>
      </PageSection>

      <PageSection title="10. Termination">
        <p>
          You can stop using the Service and delete your organization at any time. We may suspend or end your
          access if you breach these terms. Sections that by their nature should survive termination will survive.
        </p>
      </PageSection>

      <PageSection title="11. Changes to these terms">
        <p>
          We may update these terms. When we make material changes we will update the date above and, where
          appropriate, notify you. Continuing to use the Service after changes take effect means you accept them.
        </p>
      </PageSection>

      <PageSection title="12. Contact">
        <p>
          Questions about these terms? Email <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </PageSection>
    </StaticPage>
  );
}
