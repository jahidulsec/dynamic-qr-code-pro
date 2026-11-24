import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Section, SectionContainer } from "@/components/shared/section/section";
import { SectionLoader } from "@/components/shared/skeleton/section";
import { ADMIN_PAGE_TITLES, AdminOrganizationDetail, AdminPageHeader, getAdminOrganization } from "@/features/admin";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.organizations };

export default function AdminOrganizationPage({ params }: PageProps<"/admin/organizations/[id]">) {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.organizations} />
      <SectionContainer className="pt-4 md:pt-6">
        <Suspense fallback={<SectionLoader />}>
          <OrganizationDetailSection params={params} />
        </Suspense>
      </SectionContainer>
    </>
  );
}

async function OrganizationDetailSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAdminOrganization(id);

  if (!detail.success)
    return (
      <Section className="p-5">
        <p className="text-sm text-muted-foreground">{detail.message}</p>
      </Section>
    );
  if (!detail.data) notFound();

  return <AdminOrganizationDetail data={detail.data} />;
}
