import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/features/dashboard/components/page-header";
import { getOrganizationBySlug } from "@/features/organizations/services/get-organization";
import { QrAnalyticsDialog } from "@/features/qr/components/qr-analytics-dialog";
import { QrFormDialog } from "@/features/qr/components/qr-form-dialog";
import { QrPagination } from "@/features/qr/components/qr-pagination";
import { QrStats } from "@/features/qr/components/qr-stats";
import { QrTable } from "@/features/qr/components/qr-table";
import { QrToolbar } from "@/features/qr/components/qr-toolbar";
import { getQrAnalytics, getQrCode, getQrCodes, getQrStats, getQrTags } from "@/features/qr/libs/qr";
import { parseQrStyle, qrQuerySchema } from "@/features/qr/schemas/qr-schema";
import { toDateInput } from "@/utils/format";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  title: "Dashboard",
};

type SearchParams = Record<string, string | string[] | undefined>;

const stringParam = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

const idParam = (value: string | string[] | undefined) => {
  const id = Number(stringParam(value));
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

// the filters kept in every link; dialog params (new, edit, stats) are dropped unless set explicitly
const FILTER_KEYS = ["q", "department", "status", "page"];

export default async function OrganizationDashboardPage({ params, searchParams }: PageProps<"/[organizationSlug]">) {
  const { organizationSlug } = await params;
  const query: SearchParams = await searchParams;

  // the layout already guards access; this reuses its cached lookup
  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) notFound();

  const filters = qrQuerySchema.parse({
    page: stringParam(query.page),
    search: stringParam(query.q),
    tag: stringParam(query.department),
    status: stringParam(query.status),
  });

  const editId = idParam(query.edit);
  const statsId = idParam(query.stats);

  const [list, stats, tags, editResult, statsResult] = await Promise.all([
    getQrCodes(organization.slug, filters),
    getQrStats(organization.slug),
    getQrTags(organization.slug),
    editId ? getQrCode(organization.slug, editId) : null,
    statsId ? getQrAnalytics(organization.slug, statsId) : null,
  ]);
  const editing = editResult?.data;
  const analytics = statsResult?.data;
  const pageCount = Math.max(1, Math.ceil(list.count / filters.size));

  const baseUrl = getQrBaseUrl();
  const base = `/${organization.slug}`;

  const hrefWith = (changes: Record<string, string | null>) => {
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

  const isFiltered = !!(filters.search || filters.tag || filters.status !== "all");
  const tagNames = (tags.data ?? []).map((tag) => tag.name);

  return (
    <>
      <PageHeader organizationName={organization.name} title="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {stats.data && <QrStats stats={stats.data} statsHref={(id) => hrefWith({ stats: String(id) })} />}

        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <QrToolbar organizationSlug={organization.slug} tags={tagNames} />
          <QrTable
            items={list.data ?? []}
            organizationSlug={organization.slug}
            baseUrl={baseUrl}
            hrefWith={hrefWith}
            emptyMessage={
              !list.success
                ? list.message
                : isFiltered
                  ? "No QR codes match these filters."
                  : "No QR codes yet. Generate your first one to start tracking scans."
            }
          />
          <QrPagination
            page={Math.min(filters.page, pageCount)}
            pageCount={pageCount}
            count={list.count}
            hrefFor={(page) => hrefWith({ page: page > 1 ? String(page) : null })}
          />
        </div>
      </div>

      {query.new === "1" && (
        <QrFormDialog organizationSlug={organization.slug} baseUrl={baseUrl} tags={tagNames} closeHref={closeHref} />
      )}

      {editing && (
        <QrFormDialog
          key={editing.id}
          organizationSlug={organization.slug}
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
          organizationSlug={organization.slug}
          qr={analytics.qr}
          analytics={analytics.analytics}
          closeHref={closeHref}
        />
      )}
    </>
  );
}
