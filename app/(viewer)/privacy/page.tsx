import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { COMPANY_NAME, LEGAL_LAST_UPDATED, PageSection, StaticPage } from "@/features/site-pages";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your data.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const email = siteConfig.supportEmail;

  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy Policy"
      description={`This policy explains what ${COMPANY_NAME} collects when you use ${siteConfig.name}, and why.`}
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <PageSection title="Information we collect">
        <p>
          <strong>Account data.</strong> Your name, email address, password (stored hashed) and profile picture if
          you add one.
        </p>
        <p>
          <strong>Organization data.</strong> Organization name and details, members and their roles, plan and
          billing information.
        </p>
        <p>
          <strong>Content.</strong> The QR codes you create: names, destination URLs, design settings, logos and
          department tags.
        </p>
        <p>
          <strong>Scan analytics.</strong> When someone scans one of your codes we record the time, approximate
          location (country and region, derived from the IP address) and device type. To count unique visitors we
          keep a one-way, salted hash that changes daily — we never store the IP address itself and don&apos;t try
          to identify the people who scan.
        </p>
        <p>
          <strong>Technical data.</strong> Sign-in sessions, IP address and user agent for security, plus logs
          needed to run and protect the Service.
        </p>
      </PageSection>

      <PageSection title="How we use it">
        <ul>
          <li>To provide the Service: redirect scans, show analytics and run your team workspace</li>
          <li>To keep accounts secure and prevent fraud and abuse</li>
          <li>To send essential emails such as verification, password resets and invitations</li>
          <li>To provide support and improve the Service</li>
          <li>To meet legal obligations</li>
        </ul>
        <p>We don&apos;t sell your personal data.</p>
      </PageSection>

      <PageSection title="Sharing">
        <p>
          We share data only with service providers that help us run the Service (such as hosting, email delivery
          and payment processing), under contracts that require them to protect it; with members of your
          organization, according to their roles; or when required by law.
        </p>
      </PageSection>

      <PageSection title="Cookies">
        <p>
          We use cookies to keep you signed in and remember your settings. See our{" "}
          <Link href="/cookies">Cookie Preferences</Link> page for details and to change your choices.
        </p>
      </PageSection>

      <PageSection title="Retention">
        <p>
          We keep your data while your account or organization is active. Deleted QR codes stay in the trash until
          you empty it. When you delete your organization or account, we delete or anonymize the related data
          within a reasonable period, except where we must keep it by law.
        </p>
      </PageSection>

      <PageSection title="Security">
        <p>
          We protect data with encryption in transit, hashed passwords, role-based access and audit logging. If you
          find a vulnerability, please <Link href="/security">report it</Link>.
        </p>
      </PageSection>

      <PageSection title="Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export or delete your personal
          data, and to object to or restrict how we use it. You can update most details in your account settings,
          or email <a href={`mailto:${email}`}>{email}</a> for anything else.
        </p>
      </PageSection>

      <PageSection title="Changes">
        <p>
          We will update the date above when this policy changes and notify you of material changes.
        </p>
      </PageSection>

      <PageSection title="Contact">
        <p>
          Privacy questions? Email <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </PageSection>
    </StaticPage>
  );
}
