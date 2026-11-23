import type { Metadata } from "next";

import { ADMIN_PAGE_TITLES, AdminPageHeader, AdminPlaceholder } from "@/features/admin";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.organizations };

export default function AdminOrganizationsPage() {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.organizations} />
      <AdminPlaceholder title={ADMIN_PAGE_TITLES.organizations} description="Review, approve and manage every organization here." />
    </>
  );
}
