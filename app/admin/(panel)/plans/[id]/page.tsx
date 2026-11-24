import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Section, SectionContainer, SectionHeadingWithBackbutton } from "@/components/shared/section/section";
import { SectionLoader } from "@/components/shared/skeleton/section";
import { ADMIN_PAGE_TITLES, ADMIN_PATHS, AdminPageHeader, AdminPlanForm, getAdminPlan } from "@/features/admin";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.plans };

// /admin/plans/new uses the same form, empty
const NEW_PLAN_ID = "new";

export default function AdminPlanPage({ params }: PageProps<"/admin/plans/[id]">) {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.plans} />
      <SectionContainer className="pt-4 md:pt-6">
        <Suspense fallback={<SectionLoader />}>
          <PlanFormSection params={params} />
        </Suspense>
      </SectionContainer>
    </>
  );
}

async function PlanFormSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === NEW_PLAN_ID)
    return (
      <>
        <SectionHeadingWithBackbutton href={ADMIN_PATHS.plans} heading="New plan" className="pt-2 pb-1" />
        <AdminPlanForm plan={null} />
      </>
    );

  const plan = await getAdminPlan(id);

  if (!plan.success)
    return (
      <Section className="p-5">
        <p className="text-sm text-muted-foreground">{plan.message}</p>
      </Section>
    );
  if (!plan.data) notFound();

  return (
    <>
      <SectionHeadingWithBackbutton
        href={ADMIN_PATHS.plans}
        heading={plan.data.name}
        description={<span className="font-mono">{plan.data.key}</span>}
        className="pt-2 pb-1"
      />
      <AdminPlanForm key={plan.data.id} plan={plan.data} />
    </>
  );
}
