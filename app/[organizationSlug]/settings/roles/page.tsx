import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";

import { Section, SectionCardHeader, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import { Button } from "@/components/ui/button";
import { PAGE_TITLES } from "@/features/dashboard";
import {
  getAccess,
  parseRoles,
  RoleFormDialog,
  RolePermissionMatrix,
  RoleSummary,
} from "@/features/organizations/server";
import { MAX_CUSTOM_ROLES } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: `${PAGE_TITLES.roles} · ${PAGE_TITLES.settings}`,
};

export default async function RolesSettingsPage({ params }: PageProps<"/[organizationSlug]/settings/roles">) {
  const { organizationSlug } = await params;
  const access = await getAccess(organizationSlug);
  if (!access || !access.can({ ac: ["read"] })) notFound();

  const { roles, organization } = access;
  const counts: Record<string, number> = {};
  for (const member of organization.members) for (const role of parseRoles(member.role)) counts[role] = (counts[role] ?? 0) + 1;

  const systemCount = roles.filter((role) => role.system).length;
  const customCount = roles.length - systemCount;
  const canCreate = access.can({ ac: ["create"] }) && customCount < MAX_CUSTOM_ROLES;

  return (
    <>
      <Section className="overflow-hidden">
        <SectionCardHeader>
          <div className="flex items-center gap-3">
            <SectionLabel>Roles</SectionLabel>
            <SectionMeta>
              {systemCount} built-in · {customCount} of {MAX_CUSTOM_ROLES} custom
            </SectionMeta>
          </div>
          {canCreate && (
            <RoleFormDialog organizationSlug={organization.slug} trigger={<Button size="sm" />}>
              <IconPlus data-icon="inline-start" />
              New role
            </RoleFormDialog>
          )}
        </SectionCardHeader>
        <RoleSummary organizationSlug={organization.slug} roles={roles} counts={counts} />
      </Section>
      <Section className="overflow-hidden">
        <SectionCardHeader>
          <SectionLabel>Permissions</SectionLabel>
          <SectionMeta>What each role can do</SectionMeta>
        </SectionCardHeader>
        <RolePermissionMatrix roles={roles} />
      </Section>
    </>
  );
}
