import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getOrganizationBySlug,
  getSession,
  listOrganizations,
} from "@/features/organizations/services/get-organization";
import { getQrStats, getQrTags } from "@/features/qr/libs/qr";

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

  const [organization, organizations] = await Promise.all([getOrganizationBySlug(organizationSlug), listOrganizations()]);
  if (!organization) notFound();

  const [stats, departments] = await Promise.all([getQrStats(organization.slug), getQrTags(organization.slug)]);

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
        organizations={organizations.map(({ name, slug, logo }) => ({ name, slug, logo }))}
        activeSlug={organization.slug}
        qrCount={stats.data?.total ?? 0}
        departments={departments.data ?? []}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
