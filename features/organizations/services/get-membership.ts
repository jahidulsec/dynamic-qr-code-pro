import { cache } from "react";
import { APIError } from "better-auth/api";

import { SYSTEM_ROLE_INFOS, toRoleDefinitions, type RoleInfo } from "@/features/organizations/libs/roles";
import { getOrganizationBySlug, getSession } from "@/features/organizations/services/get-organization";
import { getOrganizationRoles } from "@/features/organizations/services/organization-role";
import {
  can,
  effectivePermissions,
  isSystemRole,
  normalizePermissions,
  type Permissions,
  type RoleDefinitions,
} from "@/lib/auth/permissions";

const parseJson = (value: string) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

/**
 * Every role the organization knows: the system roles, then its custom roles oldest first.
 * Read fresh (permissions must never lag behind an edit) and shared within the request.
 */
export const getRoles = cache(async (organizationId: string): Promise<RoleInfo[]> => {
  const rows = await getOrganizationRoles(
    {
      where: { organizationId },
      select: { role: true, label: true, description: true, permission: true },
      orderBy: { createdAt: "asc" },
    },
    { cache: false },
  );

  const custom = rows
    // better-auth refuses system names, but a stray row must never widen a system role
    .filter((row) => !isSystemRole(row.role))
    .map((row) => ({
      key: row.role,
      label: row.label,
      description: row.description || null,
      system: false,
      permissions: normalizePermissions(parseJson(row.permission)),
    }));

  return [...SYSTEM_ROLE_INFOS, ...custom];
});

type Membership = NonNullable<Awaited<ReturnType<typeof getMembership>>>;

export type Access = Membership & {
  roles: RoleInfo[];
  definitions: RoleDefinitions;
  /** the viewer's combined grants */
  permissions: Permissions;
  can: (permissions: Permissions) => boolean;
};

// the signed-in user's membership in an organization, or null; reuses the per-request lookups
export async function getMembership(organizationSlug: string) {
  const [session, organization] = await Promise.all([getSession(), getOrganizationBySlug(organizationSlug)]);
  if (!session || !organization) return null;

  const member = organization.members.find((member) => member.userId === session.user.id);
  if (!member) return null;

  return { session, organization, member };
}

/** The membership plus everything needed to authorize it, or null when the viewer isn't a member. */
export async function getAccess(organizationSlug: string): Promise<Access | null> {
  const membership = await getMembership(organizationSlug);
  if (!membership) return null;

  const roles = await getRoles(membership.organization.id);
  const definitions = toRoleDefinitions(roles);

  return {
    ...membership,
    roles,
    definitions,
    permissions: effectivePermissions(definitions, membership.member.role),
    can: (permissions) => can(definitions, membership.member.role, permissions),
  };
}

// the signed-in user's access, or a user-facing error; for loaders and server actions
export async function requireMembership(organizationSlug: string) {
  const session = await getSession();
  if (!session) throw new APIError("UNAUTHORIZED", { message: "Please sign in again" });

  // null when the organization doesn't exist or the user isn't a member
  const access = await getAccess(organizationSlug);
  if (!access) throw new APIError("NOT_FOUND", { message: "Organization not found" });
  return access;
}

/** As requireMembership, but the member must hold every permission asked for. */
export async function requirePermission(
  organizationSlug: string,
  permissions: Permissions,
  message = "You don't have permission to do that",
) {
  const access = await requireMembership(organizationSlug);
  if (!access.can(permissions)) throw new APIError("FORBIDDEN", { message });
  return access;
}

/** Whether the signed-in member holds the permissions; false when they can't be resolved. */
export async function hasPermission(organizationSlug: string, permissions: Permissions) {
  try {
    await requirePermission(organizationSlug, permissions);
    return true;
  } catch (error) {
    // only the resolver's own errors mean "not allowed"; anything else (DB, Next internals) propagates
    if (error instanceof APIError) return false;
    throw error;
  }
}
