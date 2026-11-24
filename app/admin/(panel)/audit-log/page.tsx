import type { Metadata } from "next";
import { Suspense } from "react";

import PagePagination from "@/components/shared/pagination/pagination";
import { Section, SectionContainer } from "@/components/shared/section/section";
import { TableSkeleton } from "@/components/shared/skeleton/table";
import {
  ADMIN_PAGE_TITLES,
  AdminAuditLogFilters,
  AdminAuditLogTable,
  AdminPageHeader,
  getAdminAuditLog,
} from "@/features/admin";
import type { SearchParams } from "@/types/params";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.auditLog };

export default function AdminAuditLogPage({ searchParams }: PageProps<"/admin/audit-log">) {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.auditLog} />
      <SectionContainer className="pt-4 md:pt-6">
        <Suspense fallback={<TableSkeleton />}>
          <AuditLogSection searchParams={searchParams} />
        </Suspense>
      </SectionContainer>
    </>
  );
}

async function AuditLogSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const log = await getAdminAuditLog(await searchParams);

  if (!log.success)
    return (
      <Section className="p-5">
        <p className="text-sm text-muted-foreground">{log.message}</p>
      </Section>
    );

  const { items, count, query, actors } = log.data;
  const isFiltered = !!(query.action || query.actor || query.target);

  return (
    <Section className="overflow-hidden">
      <AdminAuditLogFilters actors={actors} />
      <AdminAuditLogTable
        items={items}
        emptyMessage={isFiltered ? "No admin actions match these filters." : "No admin actions yet."}
      />
      {count > 0 && (
        <div className="border-t px-4 py-3">
          <PagePagination count={count} limit={query.size} />
        </div>
      )}
    </Section>
  );
}
