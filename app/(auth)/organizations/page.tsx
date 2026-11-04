import { Suspense } from "react";
import type { Metadata } from "next";

import { OrganizationList, OrganizationListSkeleton } from "@/features/organizations/components/organization-list";

export const metadata: Metadata = {
  title: "Select organization",
  robots: { index: false },
};

export default function OrganizationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Select an organization</h1>
        <p className="text-sm text-balance text-muted-foreground">Choose the workspace you want to open</p>
      </div>

      {/* reads the session, so it streams in behind the boundary */}
      <Suspense fallback={<OrganizationListSkeleton />}>
        <OrganizationList />
      </Suspense>
    </div>
  );
}
