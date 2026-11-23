import type { Metadata } from "next";

import { ADMIN_PAGE_TITLES, AdminPageHeader, AdminPlaceholder } from "@/features/admin";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.users };

export default function AdminUsersPage() {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.users} />
      <AdminPlaceholder title={ADMIN_PAGE_TITLES.users} description="Search users, ban or unban them and revoke their sessions here." />
    </>
  );
}
