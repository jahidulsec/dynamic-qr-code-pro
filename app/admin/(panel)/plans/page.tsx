import type { Metadata } from "next";

import { ADMIN_PAGE_TITLES, AdminPageHeader, AdminPlaceholder } from "@/features/admin";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.plans };

export default function AdminPlansPage() {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.plans} />
      <AdminPlaceholder title={ADMIN_PAGE_TITLES.plans} description="Create and edit plans, their limits and features here." />
    </>
  );
}
