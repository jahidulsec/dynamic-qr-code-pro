import type { Metadata } from "next";
import { Suspense } from "react";

import PagePagination from "@/components/shared/pagination/pagination";
import { Section, SectionContainer, SectionIntro } from "@/components/shared/section/section";
import { TableSkeleton } from "@/components/shared/skeleton/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_TITLES } from "@/features/dashboard";
import { PageHeader } from "@/features/dashboard/server";
import {
  getQrCodes,
  getQrStats,
  qrSearchParamsSchema,
  QrStats,
  QrTable,
  QrToolbar,
} from "@/features/qr";
import { QrCreateAction } from "@/features/qr/server";
import { getQrTags } from "@/features/qr-tags";
import type { SearchParams } from "@/types/params";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  title: PAGE_TITLES.dashboard,
};

export default async function OrganizationDashboardPage({
  params,
  searchParams,
}: PageProps<"/[organizationSlug]">) {
  const { organizationSlug } = await params;

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title={PAGE_TITLES.dashboard} />
      <SectionContainer>
        <SectionIntro
          title={PAGE_TITLES.dashboard}
          description="Every dynamic QR code in this organization. Change where a code points without reprinting it."
          actions={
            <Suspense fallback={<Skeleton className="h-9 w-32" />}>
              <QrCreateAction organizationSlug={organizationSlug} />
            </Suspense>
          }
        />
        <Suspense>
          <StatsSection organizationSlug={organizationSlug} />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <TableSection
            organizationSlug={organizationSlug}
            searchParams={searchParams}
          />
        </Suspense>
      </SectionContainer>
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
    <Section className="overflow-hidden">
      <QrToolbar organizationSlug={organizationSlug} />
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
    </Section>
  );
}
