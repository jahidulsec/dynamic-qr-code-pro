import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AppSidebar } from "@/features/dashboard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AccessProvider } from "@/features/organizations";
import { getAccess, getSession, listOrganizations } from "@/features/organizations/server";
import { getQrCount } from "@/features/qr";
import { getQrTags } from "@/features/qr-tags";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function OrganizationLayout({ children, params }: LayoutProps<"/[organizationSlug]">) {
  return (
    <Suspense>
      <OrganizationShell params={params}>{children}</OrganizationShell>
    </Suspense>
  );
}

async function OrganizationShell({ children, params }: LayoutProps<"/[organizationSlug]">) {
  const { organizationSlug } = await params;

  const session = await getSession();
  if (!session) redirect("/sign-in");

  const [access, organizations] = await Promise.all([getAccess(organizationSlug), listOrganizations()]);
  if (!access) notFound();
  const { organization } = access;

  // the sidebar reads fresh so its counts never lag behind the page
  const [qrCount, departments] = await Promise.all([
    getQrCount(organization.slug),
    getQrTags(organization.slug, { cache: false }),
  ]);

  return (
    // only shapes the UI; every action re-checks permissions on the server
    <AccessProvider value={{ role: access.member.role, permissions: access.permissions, roles: access.roles }}>
      <SidebarProvider>
        <AppSidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            emailVerified: session.user.emailVerified,
            createdAt: session.user.createdAt,
          }}
          organizations={organizations.map(({ name, slug, logo }) => ({ name, slug, logo }))}
          activeSlug={organization.slug}
          baseUrl={getQrBaseUrl()}
          qrCount={qrCount.data ?? 0}
          departments={departments.data ?? []}
        />
        <SidebarInset className="min-w-0">{children}</SidebarInset>
      </SidebarProvider>
    </AccessProvider>
  );
}
