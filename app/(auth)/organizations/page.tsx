import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { IconShieldLock } from "@tabler/icons-react";

import { buttonVariants } from "@/components/ui/button";
import { ADMIN_HOME_PATH } from "@/features/admin";
import { getAdminSession } from "@/features/admin/server";
import { OrganizationList, OrganizationListSkeleton } from "@/features/organizations/server";

export const metadata: Metadata = {
  title: "Select organization",
  robots: { index: false },
};

// `?requested=<slug>` arrives from createOrganizationAction
async function OrganizationListWithNotice({ searchParams }: Pick<PageProps<"/organizations">, "searchParams">) {
  const { requested } = await searchParams;
  return <OrganizationList requested={typeof requested === "string" ? requested : undefined} />;
}

// platform admins (superadmin role) get a shortcut to the admin portal
async function AdminPortalLink() {
  const adminSession = await getAdminSession();
  if (!adminSession) return null;

  return (
    <Link href={ADMIN_HOME_PATH} className={buttonVariants({ variant: "ghost" })}>
      <IconShieldLock />
      Go to admin portal
    </Link>
  );
}

export default function OrganizationsPage({ searchParams }: PageProps<"/organizations">) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Select an organization</h1>
        <p className="text-sm text-balance text-muted-foreground">Choose the workspace you want to open</p>
      </div>

      {/* reads the session, so it streams in behind the boundary */}
      <Suspense fallback={<OrganizationListSkeleton />}>
        <OrganizationListWithNotice searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={null}>
        <AdminPortalLink />
      </Suspense>
    </div>
  );
}
