import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SiteLogo } from "@/components/shared/site-header";
import { ADMIN_HOME_PATH, AdminLoginForm } from "@/features/admin";
import { getAdminSession } from "@/features/admin/server";
import { SwitchAccountButton } from "@/features/auth";
import { getSession } from "@/features/organizations/server";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

async function AdminLoginGate() {
  if (await getAdminSession()) redirect(ADMIN_HOME_PATH);

  const session = await getSession();
  if (!session) return <AdminLoginForm />;

  // a signed-in non-admin; the panel layout sends them here too
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">No admin access</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.user.email}</span>. This account
          doesn&apos;t have admin access.
        </p>
      </div>
      <div className="flex justify-center">
        <SwitchAccountButton />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh flex-col gap-4 p-6 md:p-10">
      <div className="flex justify-center md:justify-start">
        <SiteLogo />
      </div>
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm">
          {/* the form is the static shell; the session check streams in behind it */}
          <Suspense fallback={<AdminLoginForm />}>
            <AdminLoginGate />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
