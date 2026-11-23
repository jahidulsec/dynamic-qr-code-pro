import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ADMIN_LOGIN_PATH, AdminSidebar, getPendingOrganizationCount } from "@/features/admin";
import { getAdminSession } from "@/features/admin/server";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { template: `%s · Admin | ${siteConfig.name}`, default: "Admin" },
  robots: { index: false, follow: false },
};

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

// only shapes the UI; every admin loader and action calls requireAdmin() itself
async function AdminShell({ children }: { children: React.ReactNode }) {
  // signed out and signed-in non-admins both land on the login page, which explains which it is
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);

  const pendingCount = await getPendingOrganizationCount();

  return (
    <SidebarProvider>
      <AdminSidebar
        user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
        pendingCount={pendingCount.data ?? 0}
      />
      <SidebarInset className="min-w-0">{children}</SidebarInset>
    </SidebarProvider>
  );
}
