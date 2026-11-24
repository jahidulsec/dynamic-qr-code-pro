import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import {
  COOKIE_CONSENT_NAME,
  CookiePreferencesForm,
  LEGAL_LAST_UPDATED,
  PageSection,
  StaticPage,
} from "@/features/site-pages";

export const metadata: Metadata = {
  title: "Cookie Preferences",
  description: `Choose which cookies ${siteConfig.name} may use.`,
  alternates: { canonical: "/cookies" },
};

const essentialCookies = [
  { name: "better-auth.session_token", purpose: "Keeps you signed in", duration: "Session / up to 7 days" },
  { name: "sidebar_state", purpose: "Remembers whether the dashboard sidebar is open", duration: "7 days" },
  { name: COOKIE_CONSENT_NAME, purpose: "Stores the choices you make on this page", duration: "1 year" },
];

export default function CookiesPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Cookie Preferences"
      description="Choose which optional cookies we may use. You can change this at any time."
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <PageSection title="Your choices">
        <CookiePreferencesForm />
      </PageSection>

      <PageSection title="Cookies we always use">
        <p>These are needed for the site to work and can&apos;t be turned off.</p>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Cookie</th>
                <th className="px-4 py-2 font-medium">Purpose</th>
                <th className="px-4 py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {essentialCookies.map((cookie) => (
                <tr key={cookie.name}>
                  <td className="px-4 py-2 font-mono text-xs text-foreground">{cookie.name}</td>
                  <td className="px-4 py-2">{cookie.purpose}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{cookie.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>

      <PageSection title="QR code scans">
        <p>
          Scanning a QR code doesn&apos;t set any cookies. Scan analytics are recorded on our servers from the
          request itself — see the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </PageSection>
    </StaticPage>
  );
}
