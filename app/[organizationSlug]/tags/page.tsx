import type { Metadata } from "next";
import { Suspense } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/features/dashboard/server";
import { isOrganizationAdmin } from "@/features/qr/server";
import { getQrTags, QrTagFormDialog, QrTagTable } from "@/features/qr-tags";

export const metadata: Metadata = {
  title: "Department Tags",
};

export default async function TagsPage({ params }: PageProps<"/[organizationSlug]/tags">) {
  const { organizationSlug } = await params;

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title="Department Tags" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Tags group QR codes on the dashboard. Renaming one updates every code that uses it.
          </p>
          <QrTagFormDialog organizationSlug={organizationSlug} trigger={<Button size="sm" />}>
            <IconPlus data-icon="inline-start" />
            New tag
          </QrTagFormDialog>
        </div>
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Suspense>
            <TagsSection organizationSlug={organizationSlug} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

async function TagsSection({ organizationSlug }: { organizationSlug: string }) {
  const [tags, canManage] = await Promise.all([getQrTags(organizationSlug), isOrganizationAdmin(organizationSlug)]);

  return (
    <QrTagTable
      items={tags.data ?? []}
      organizationSlug={organizationSlug}
      canManage={canManage}
      codesHref={(name) => `/${organizationSlug}?${new URLSearchParams({ department: name })}`}
      emptyMessage={tags.success ? "No tags yet. Create one, or type a new tag when saving a QR code." : tags.message}
    />
  );
}
