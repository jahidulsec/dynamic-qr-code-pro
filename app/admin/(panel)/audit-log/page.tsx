import type { Metadata } from "next";

import { ADMIN_PAGE_TITLES, AdminPageHeader, AdminPlaceholder } from "@/features/admin";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.auditLog };

export default function AdminAuditLogPage() {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.auditLog} />
      <AdminPlaceholder title={ADMIN_PAGE_TITLES.auditLog} description="Every admin action will be listed here, newest first." />
    </>
  );
}
