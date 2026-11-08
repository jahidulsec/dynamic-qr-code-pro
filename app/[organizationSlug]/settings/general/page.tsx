import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/shared/section/section";
import { PAGE_TITLES } from "@/features/dashboard";
import {
  getMembership,
  isManagerRole,
  isOwnerRole,
  OrganizationDangerZone,
  OrganizationGeneralForm,
} from "@/features/organizations/server";

export const metadata: Metadata = {
  title: `${PAGE_TITLES.general} · ${PAGE_TITLES.settings}`,
};

export default async function GeneralSettingsPage({ params }: PageProps<"/[organizationSlug]/settings/general">) {
  const { organizationSlug } = await params;
  const membership = await getMembership(organizationSlug);
  if (!membership) notFound();

  const { organization, member } = membership;
  const ownerCount = organization.members.filter((m) => isOwnerRole(m.role)).length;
  const viewerIsOwner = isOwnerRole(member.role);

  return (
    <>
      <Section className="overflow-hidden">
        <OrganizationGeneralForm
          organization={{ name: organization.name, slug: organization.slug, logo: organization.logo ?? null }}
          canEdit={isManagerRole(member.role)}
        />
      </Section>
      <Section className="overflow-hidden ring-destructive/30">
        <OrganizationDangerZone
          organization={{ name: organization.name, slug: organization.slug }}
          canDelete={viewerIsOwner}
          canLeave={!viewerIsOwner || ownerCount > 1}
        />
      </Section>
    </>
  );
}
