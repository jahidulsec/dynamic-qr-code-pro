import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Section, SectionContainer, SectionIntro } from "@/components/shared/section/section";
import { TableSkeleton } from "@/components/shared/skeleton/table";
import { Button } from "@/components/ui/button";
import { ADMIN_PAGE_TITLES, ADMIN_PATHS, AdminPageHeader, AdminPlanTable, getAdminPlans } from "@/features/admin";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.plans };

export default function AdminPlansPage() {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.plans} />
      <SectionContainer className="pt-4 md:pt-6">
        <SectionIntro
          title={ADMIN_PAGE_TITLES.plans}
          description="Limits and features apply at once to every organization on a plan. Organizations without a subscription in effect use the default plan."
          actions={
            <Button nativeButton={false} render={<Link href={`${ADMIN_PATHS.plans}/new`} />}>
              <IconPlus />
              New plan
            </Button>
          }
        />
        <Suspense fallback={<TableSkeleton />}>
          <PlansSection />
        </Suspense>
      </SectionContainer>
    </>
  );
}

async function PlansSection() {
  const plans = await getAdminPlans();

  if (!plans.success)
    return (
      <Section className="p-5">
        <p className="text-sm text-muted-foreground">{plans.message}</p>
      </Section>
    );

  return (
    <Section className="overflow-hidden">
      <AdminPlanTable plans={plans.data} />
    </Section>
  );
}
