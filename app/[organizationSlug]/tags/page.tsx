import type { Metadata } from "next";
import { Suspense } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Section, SectionContainer, SectionIntro } from "@/components/shared/section/section";
import { Button } from "@/components/ui/button";
import { PAGE_TITLES } from "@/features/dashboard";
import { PageHeader } from "@/features/dashboard/server";
import { getAccess } from "@/features/organizations/server";
import { getQrTags, QrTagFormDialog, QrTagTable } from "@/features/qr-tags";

export const metadata: Metadata = {
  title: PAGE_TITLES.tags,
};

export default async function TagsPage({ params }: PageProps<"/[organizationSlug]/tags">) {
  const { organizationSlug } = await params;

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title={PAGE_TITLES.tags} />
      <SectionContainer>
        <SectionIntro
          title={PAGE_TITLES.tags}
          description="Tags group QR codes on the dashboard. Renaming one updates every code that uses it."
          actions={
            <Suspense>
              <NewTagAction organizationSlug={organizationSlug} />
            </Suspense>
          }
        />
        <Section className="overflow-hidden">
          <Suspense>
            <TagsSection organizationSlug={organizationSlug} />
          </Suspense>
        </Section>
      </SectionContainer>
    </>
  );
}

async function NewTagAction({ organizationSlug }: { organizationSlug: string }) {
  const access = await getAccess(organizationSlug);
  if (!access?.can({ tag: ["create"] })) return null;

  return (
    <QrTagFormDialog organizationSlug={organizationSlug} trigger={<Button />}>
      <IconPlus data-icon="inline-start" />
      New tag
    </QrTagFormDialog>
  );
}

async function TagsSection({ organizationSlug }: { organizationSlug: string }) {
  const [tags, access] = await Promise.all([getQrTags(organizationSlug), getAccess(organizationSlug)]);
  const canManage = !!access && (access.can({ tag: ["update"] }) || access.can({ tag: ["delete"] }));

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
