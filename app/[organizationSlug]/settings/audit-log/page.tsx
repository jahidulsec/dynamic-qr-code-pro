import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PagePagination from "@/components/shared/pagination/pagination";
import { Section, SectionCardHeader, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import { PAGE_TITLES } from "@/features/dashboard";
import { AUDIT_PAGE_SIZE, AuditLogTable, getAuditLog, hasPermission } from "@/features/organizations/server";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = {
  title: `${PAGE_TITLES.auditLog} · ${PAGE_TITLES.settings}`,
};

const toNumber = (value: string | string[] | undefined) => (typeof value === "string" ? Number(value) : undefined);

export default async function AuditLogSettingsPage({
  params,
  searchParams,
}: PageProps<"/[organizationSlug]/settings/audit-log">) {
  const [{ organizationSlug }, query] = await Promise.all([params, searchParams]);
  if (!(await hasPermission(organizationSlug, { audit: ["read"] }))) notFound();

  const log = await getAuditLog(
    organizationSlug,
    { page: toNumber(query.page), size: toNumber(query.size) ?? AUDIT_PAGE_SIZE },
    formatDate,
  );

  return (
    <Section className="overflow-hidden">
      <SectionCardHeader>
        <div className="flex items-center gap-3">
          <SectionLabel>Audit log</SectionLabel>
          <SectionMeta>{log.count}</SectionMeta>
        </div>
        <SectionMeta>Role, member and invitation changes</SectionMeta>
      </SectionCardHeader>
      <AuditLogTable
        rows={log.data ?? []}
        emptyMessage={log.success ? "No access changes yet." : log.message}
      />
      {log.count > 0 && (
        <div className="border-t px-4 py-3">
          <PagePagination count={log.count} limit={AUDIT_PAGE_SIZE} />
        </div>
      )}
    </Section>
  );
}
