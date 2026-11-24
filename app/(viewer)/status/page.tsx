import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { siteConfig } from "@/config/site";
import { PageSection, StaticPage } from "@/features/site-pages";
import { SystemStatus, SystemStatusSkeleton } from "@/features/site-pages/server";

export const metadata: Metadata = {
  title: "System Status",
  description: `Live status of ${siteConfig.name} services.`,
  alternates: { canonical: "/status" },
};

export default function StatusPage() {
  return (
    <StaticPage
      eyebrow="System Status"
      title="System status"
      description="Live health of the services behind your dynamic QR codes."
    >
      <Suspense fallback={<SystemStatusSkeleton />}>
        <SystemStatus />
      </Suspense>

      <PageSection title="Seeing a problem that isn't listed?">
        <p>
          Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> or visit the{" "}
          <Link href="/support">support page</Link>.
        </p>
      </PageSection>
    </StaticPage>
  );
}
