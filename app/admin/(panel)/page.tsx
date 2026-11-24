import { Suspense } from "react";

import { Section, SectionContainer } from "@/components/shared/section/section";
import { SectionLoader } from "@/components/shared/skeleton/section";
import { ADMIN_PAGE_TITLES, AdminDashboard, AdminPageHeader, getAdminDashboard } from "@/features/admin";

// no title of its own: a template doesn't reach the page in its own segment, so the layout's default ("Admin") names it
export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.dashboard} />
      <SectionContainer className="pt-4 md:pt-6">
        <Suspense fallback={<SectionLoader />}>
          <DashboardSection />
        </Suspense>
      </SectionContainer>
    </>
  );
}

async function DashboardSection() {
  const dashboard = await getAdminDashboard();

  if (!dashboard.success)
    return (
      <Section className="p-5">
        <p className="text-sm text-muted-foreground">{dashboard.message}</p>
      </Section>
    );

  return <AdminDashboard data={dashboard.data} />;
}
