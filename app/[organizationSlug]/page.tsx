import type { Metadata } from "next";
import { Suspense } from "react";

import PagePagination from "@/components/shared/pagination/pagination";
import { TableSkeleton } from "@/components/shared/skeleton/table";
import { PageHeader } from "@/features/dashboard/server";
import {
  getQrCodes,
  getQrStats,
  qrSearchParamsSchema,
  QrStats,
  QrTable,
  QrToolbar,
} from "@/features/qr";
import { getQrTags } from "@/features/qr-tags";
import type { SearchParams } from "@/types/params";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function OrganizationDashboardPage({
  params,
  searchParams,
}: PageProps<"/[organizationSlug]">) {
  const { organizationSlug } = await params;

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense>
          <StatsSection organizationSlug={organizationSlug} />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <TableSection
            organizationSlug={organizationSlug}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </>
  );
}

async function StatsSection({
  organizationSlug,
}: {
  organizationSlug: string;
}) {
  const stats = await getQrStats(organizationSlug);
  if (!stats.data) return null;

  return <QrStats stats={stats.data} organizationSlug={organizationSlug} />;
}

async function TableSection({
  organizationSlug,
  searchParams,
}: {
  organizationSlug: string;
  searchParams: Promise<SearchParams>;
}) {
  const filters = qrSearchParamsSchema.parse(await searchParams);

  const [list, tags] = await Promise.all([
    getQrCodes(organizationSlug, filters),
    getQrTags(organizationSlug),
  ]);
  const baseUrl = getQrBaseUrl();
  const tagNames = (tags.data ?? []).map((tag) => tag.name);

  const isFiltered = !!(
    filters.search ||
    filters.tag ||
    filters.status !== "all"
  );
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <QrToolbar
        organizationSlug={organizationSlug}
        baseUrl={baseUrl}
        tags={tagNames}
      />
      <QrTable
        items={list.data ?? []}
        organizationSlug={organizationSlug}
        baseUrl={baseUrl}
        tags={tagNames}
        emptyMessage={
          !list.success
            ? list.message
            : isFiltered
              ? "No QR codes match these filters."
              : "No QR codes yet. Generate your first one to start tracking scans."
        }
      />
      {list.count > 0 && (
        <div className="border-t px-4 py-3">
          <PagePagination count={list.count} limit={filters.size} />
        </div>
      )}
    </div>
  );
}
