import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import PagePagination from "@/components/shared/pagination/pagination";
import { PageHeader } from "@/features/dashboard";
import { getOrganizationBySlug } from "@/features/organizations/server";
import {
  getQrAnalytics,
  getQrCode,
  getQrCodes,
  getQrStats,
  parseQrStyle,
  QrAnalyticsDialog,
  QrFormDialog,
  qrQuerySchema,
  QrStats,
  QrTable,
  QrToolbar,
} from "@/features/qr";
import { getQrTags } from "@/features/qr-tags";
import type { SearchParams } from "@/types/params";
import { toDateInput } from "@/utils/format";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  title: "Dashboard",
};

const stringParam = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

const idParam = (value: string | string[] | undefined) => {
  const id = Number(stringParam(value));
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

// the filters kept in every link; dialog params (new, edit, stats) are dropped unless set explicitly
const FILTER_KEYS = ["q", "department", "status", "page", "size"];

type HrefWith = (changes: Record<string, string | null>) => string;

export default async function OrganizationDashboardPage({ params, searchParams }: PageProps<"/[organizationSlug]">) {
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

  const editId = idParam(query.edit);
  const statsId = idParam(query.stats);

  const base = `/${organization.slug}`;
  const hrefWith: HrefWith = (changes) => {
    const next = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = stringParam(query[key]);
      if (value) next.set(key, value);
    }
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const search = next.toString();
    return search ? `${base}?${search}` : base;
  };
  const closeHref = hrefWith({});
  const slug = organization.slug;

  return (
    <>
      <PageHeader organizationName={organization.name} title="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense>
          <StatsSection organizationSlug={slug} hrefWith={hrefWith} />
        </Suspense>
        <Suspense>
          <TableSection organizationSlug={slug} filters={filters} hrefWith={hrefWith} />
        </Suspense>
      </div>

      <Suspense>
        <DialogSection
          organizationSlug={slug}
          isNew={query.new === "1"}
          editId={editId}
          statsId={statsId}
          closeHref={closeHref}
        />
      </Suspense>
    </>
  );
}

async function StatsSection({ organizationSlug, hrefWith }: { organizationSlug: string; hrefWith: HrefWith }) {
  const stats = await getQrStats(organizationSlug);
  if (!stats.data) return null;

  return <QrStats stats={stats.data} statsHref={(id) => hrefWith({ stats: String(id) })} />;
}

async function TableSection({
  organizationSlug,
  filters,
  hrefWith,
}: {
  organizationSlug: string;
  filters: ReturnType<typeof qrQuerySchema.parse>;
  hrefWith: HrefWith;
}) {
  const [list, tags] = await Promise.all([getQrCodes(organizationSlug, filters), getQrTags(organizationSlug)]);

  const isFiltered = !!(filters.search || filters.tag || filters.status !== "all");
  const tagNames = (tags.data ?? []).map((tag) => tag.name);

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <QrToolbar organizationSlug={organizationSlug} tags={tagNames} />
      <QrTable
        items={list.data ?? []}
        organizationSlug={organizationSlug}
        baseUrl={getQrBaseUrl()}
        hrefWith={hrefWith}
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

async function DialogSection({
  organizationSlug,
  isNew,
  editId,
  statsId,
  closeHref,
}: {
  organizationSlug: string;
  isNew: boolean;
  editId?: number;
  statsId?: number;
  closeHref: string;
}) {
  if (!isNew && !editId && !statsId) return null;

  const [tags, editResult, statsResult] = await Promise.all([
    isNew || editId ? getQrTags(organizationSlug) : null,
    editId ? getQrCode(organizationSlug, editId) : null,
    statsId ? getQrAnalytics(organizationSlug, statsId) : null,
  ]);
  const tagNames = (tags?.data ?? []).map((tag) => tag.name);
  const editing = editResult?.data;
  const analytics = statsResult?.data;
  const baseUrl = getQrBaseUrl();

  return (
    <>
      {isNew && (
        <QrFormDialog organizationSlug={organizationSlug} baseUrl={baseUrl} tags={tagNames} closeHref={closeHref} />
      )}

      {editing && (
        <QrFormDialog
          key={editing.id}
          organizationSlug={organizationSlug}
          baseUrl={baseUrl}
          tags={tagNames}
          closeHref={closeHref}
          qr={{
            id: editing.id,
            values: {
              name: editing.name,
              destination: editing.destination,
              slug: editing.slug,
              tag: editing.tag?.name ?? "",
              expiresAt: editing.expiresAt ? toDateInput(editing.expiresAt) : "",
              style: parseQrStyle(editing.style),
            },
          }}
        />
      )}

      {analytics && (
        <QrAnalyticsDialog
          organizationSlug={organizationSlug}
          qr={analytics.qr}
          analytics={analytics.analytics}
          closeHref={closeHref}
        />
      )}
    </>
  );
}
