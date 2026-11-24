import type { Metadata } from "next";
import { Suspense } from "react";

import PagePagination from "@/components/shared/pagination/pagination";
import { Section, SectionContainer } from "@/components/shared/section/section";
import { TableSkeleton } from "@/components/shared/skeleton/table";
import {
  ADMIN_PAGE_TITLES,
  AdminOrganizationFilters,
  AdminOrganizationTable,
  AdminPageHeader,
  getAdminOrganizations,
} from "@/features/admin";
import type { SearchParams } from "@/types/params";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.organizations };

export default function AdminOrganizationsPage({ searchParams }: PageProps<"/admin/organizations">) {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.organizations} />
      <SectionContainer className="pt-4 md:pt-6">
        <Suspense fallback={<TableSkeleton />}>
          <OrganizationsSection searchParams={searchParams} />
        </Suspense>
      </SectionContainer>
    </>
  );
}

async function OrganizationsSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const list = await getAdminOrganizations(await searchParams);

  if (!list.success)
    return (
      <Section className="p-5">
        <p className="text-sm text-muted-foreground">{list.message}</p>
      </Section>
    );

  const { items, count, counts, query, plans, defaultPlanName } = list.data;
  const isFiltered = !!(query.search || query.plan || query.expiring);

  return (
    <Section className="overflow-hidden">
      <AdminOrganizationFilters status={query.status} counts={counts} plans={plans} />
      <AdminOrganizationTable
        items={items}
        defaultPlanName={defaultPlanName}
        emptyMessage={isFiltered ? "No organizations match these filters." : "No organizations here yet."}
      />
      {count > 0 && (
        <div className="border-t px-4 py-3">
          <PagePagination count={count} limit={query.size} />
        </div>
      )}
    </Section>
  );
}
