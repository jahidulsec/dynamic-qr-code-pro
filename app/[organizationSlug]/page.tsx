import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import PagePagination from "@/components/shared/pagination/pagination";
import { PageHeader } from "@/features/dashboard";
import { getOrganizationBySlug } from "@/features/organizations/server";
import {
  getQrCodes,
  getQrStats,
  qrQuerySchema,
  QrStats,
  QrTable,
  QrToolbar,
} from "@/features/qr";
import { getQrTags } from "@/features/qr-tags";
import type { SearchParams } from "@/types/params";
import { getQrBaseUrl } from "@/utils/short-link";
import { TableSkeleton } from "@/components/shared/skeleton/table";

export const metadata: Metadata = {
  title: "Dashboard",
};

const stringParam = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

export default async function OrganizationDashboardPage({
  params,
  searchParams,
}: PageProps<"/[organizationSlug]">) {
  const { organizationSlug } = await params;
  const query: SearchParams = await searchParams;

  // the layout already guards access; this reuses its cached lookup
  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) notFound();

  const filters = qrQuerySchema.parse({
    page: stringParam(query.page),
    size: stringParam(query.size),
    search: stringParam(query.q),
    tag: stringParam(query.department),
    status: stringParam(query.status),
  });

  const slug = organization.slug;

  return (
    <>
      <PageHeader organizationName={organization.name} title="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense>
          <StatsSection organizationSlug={slug} />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <TableSection organizationSlug={slug} filters={filters} />
        </Suspense>
      </div>
    </>
  );
}

async function StatsSection({ organizationSlug }: { organizationSlug: string }) {
  const stats = await getQrStats(organizationSlug);
  if (!stats.data) return null;

  return <QrStats stats={stats.data} organizationSlug={organizationSlug} />;
}

async function TableSection({
  organizationSlug,
  filters,
}: {
  organizationSlug: string;
  filters: ReturnType<typeof qrQuerySchema.parse>;
}) {
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
