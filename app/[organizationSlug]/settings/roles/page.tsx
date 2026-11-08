import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section, SectionCardHeader, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import { PAGE_TITLES } from "@/features/dashboard";
import {
  getMembership,
  ORGANIZATION_ROLES,
  parseRoles,
  RolePermissionMatrix,
  RoleSummary,
  type OrganizationRole,
} from "@/features/organizations/server";

export const metadata: Metadata = {
  title: `${PAGE_TITLES.roles} · ${PAGE_TITLES.settings}`,
};

export default async function RolesSettingsPage({ params }: PageProps<"/[organizationSlug]/settings/roles">) {
  const { organizationSlug } = await params;
  const membership = await getMembership(organizationSlug);
  if (!membership) notFound();

  const counts = Object.fromEntries(ORGANIZATION_ROLES.map((role) => [role, 0])) as Record<OrganizationRole, number>;
  for (const member of membership.organization.members) for (const role of parseRoles(member.role)) counts[role]++;

  return (
    <>
      <Section className="overflow-hidden">
        <SectionCardHeader>
          <SectionLabel>Roles</SectionLabel>
          <SectionMeta>{ORGANIZATION_ROLES.length} built-in</SectionMeta>
        </SectionCardHeader>
        <RoleSummary
          counts={counts}
          membersHref={(role) => `/${organizationSlug}/settings/members?${new URLSearchParams({ role })}`}
        />
      </Section>
      <Section className="overflow-hidden">
        <SectionCardHeader>
          <SectionLabel>Permissions</SectionLabel>
          <SectionMeta>Read-only</SectionMeta>
        </SectionCardHeader>
        <RolePermissionMatrix />
      </Section>
    </>
  );
}
