import { ADMIN_PAGE_TITLES, AdminPageHeader, AdminPlaceholder } from "@/features/admin";

// no title of its own: a template doesn't reach the page in its own segment, so the layout's default ("Admin") names it
export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.dashboard} />
      <AdminPlaceholder title={ADMIN_PAGE_TITLES.dashboard} description="Pending requests, platform totals and recent admin activity will show here." />
    </>
  );
}
