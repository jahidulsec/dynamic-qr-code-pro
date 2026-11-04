import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";
import { getSession, listOrganizations } from "@/features/organizations/services/get-organization";

export const metadata: Metadata = {
  title: "Create organization",
  robots: { index: false },
};

export default function NewOrganizationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Create an organization</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Organizations hold your QR codes and the people who manage them
        </p>
      </div>

      {/* reads the session, so it streams in behind the boundary */}
      <Suspense fallback={<Skeleton className="h-55 rounded-lg" />}>
        <AuthorizedForm />
      </Suspense>
    </div>
  );
}

async function AuthorizedForm() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const organizations = await listOrganizations();

  return <CreateOrganizationForm canGoBack={organizations.length > 0} />;
}
