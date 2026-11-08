"use server";

import { headers } from "next/headers";
import { refresh, updateTag } from "next/cache";
import { APIError } from "better-auth/api";

import { recordAudit } from "@/features/organizations/libs/audit";
import { parseRoles, roleKeyFromLabel } from "@/features/organizations/libs/roles";
import { roleFormSchema, roleKeySchema, type RoleFormSubmit } from "@/features/organizations/schemas/role-schema";
import { requirePermission, type Access } from "@/features/organizations/services/get-membership";
import { auth, MAX_CUSTOM_ROLES } from "@/lib/auth/auth";
import { countPermissions, missingPermissions, type Permissions } from "@/lib/auth/permissions";
import { cacheTags, organizationTag } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const bustRoles = (organizationId: string) =>
  [cacheTags.organizationRoles, organizationTag(organizationId)].forEach((tag) => updateTag(tag));

// better-auth checks this too; failing here first gives a clearer message
function assertHolds(access: Access, permissions: Permissions, message: string) {
  if (missingPermissions(access.permissions, permissions).length) throw new APIError("FORBIDDEN", { message });
}

function findCustomRole(access: Access, key: string) {
  const role = access.roles.find((r) => r.key === key);
  if (!role) throw new APIError("NOT_FOUND", { message: "Role not found" });
  if (role.system) throw new APIError("BAD_REQUEST", { message: "Built-in roles can't be changed" });
  return role;
}

// the editor submits every resource, most with no actions; store only what is granted
const toStored = (permissions: Permissions) =>
  Object.fromEntries(Object.entries(permissions).filter(([, actions]) => actions?.length)) as Record<string, string[]>;

export const createRoleAction = async (organizationSlug: string, input: RoleFormSubmit) => {
  try {
    const { label, description, permissions } = roleFormSchema.parse(input);
    const access = await requirePermission(organizationSlug, { ac: ["create"] }, "You can't create roles");
    const key = roleKeyFromLabel(label);

    if (access.roles.some((role) => role.key === key || role.label.toLowerCase() === label.toLowerCase()))
      throw new APIError("CONFLICT", { message: `A role named ${label} already exists` });
    if (access.roles.filter((role) => !role.system).length >= MAX_CUSTOM_ROLES)
      throw new APIError("BAD_REQUEST", { message: `An organization can have up to ${MAX_CUSTOM_ROLES} custom roles` });
    assertHolds(access, permissions, "You can only grant permissions you have yourself");

    await auth.api.createOrgRole({
      body: {
        organizationId: access.organization.id,
        role: key,
        permission: toStored(permissions),
        additionalFields: { label, description },
      },
      headers: await headers(),
    });

    await recordAudit(access, "role.create", label, { permissions: countPermissions(permissions) });
    bustRoles(access.organization.id);
    refresh();
    return apiResponse.single({ message: `Role ${label} created`, data: { key } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// the key is what members store, so it never changes; the label, description and grants can
export const updateRoleAction = async (organizationSlug: string, roleKey: string, input: RoleFormSubmit) => {
  try {
    const key = roleKeySchema.parse(roleKey);
    const { label, description, permissions } = roleFormSchema.parse(input);
    const access = await requirePermission(organizationSlug, { ac: ["update"] }, "You can't edit roles");
    const role = findCustomRole(access, key);

    if (access.roles.some((r) => r.key !== key && r.label.toLowerCase() === label.toLowerCase()))
      throw new APIError("CONFLICT", { message: `A role named ${label} already exists` });
    // editing a role changes what its members can do, so it's limited to roles within your own access
    assertHolds(access, role.permissions, "This role has permissions you don't have");
    assertHolds(access, permissions, "You can only grant permissions you have yourself");

    await auth.api.updateOrgRole({
      body: {
        organizationId: access.organization.id,
        roleName: key,
        // an empty description is sent as "" (not undefined) so an edit can clear it
        data: { permission: toStored(permissions), label, description },
      },
      headers: await headers(),
    });

    await recordAudit(access, "role.update", label, {
      from: countPermissions(role.permissions),
      to: countPermissions(permissions),
      ...(role.label !== label && { renamedFrom: role.label }),
    });
    bustRoles(access.organization.id);
    refresh();
    return apiResponse.single({ message: `Role ${label} updated`, data: { key } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const deleteRoleAction = async (organizationSlug: string, roleKey: string) => {
  try {
    const key = roleKeySchema.parse(roleKey);
    const access = await requirePermission(organizationSlug, { ac: ["delete"] }, "You can't delete roles");
    const role = findCustomRole(access, key);
    assertHolds(access, role.permissions, "This role has permissions you don't have");

    const holders = access.organization.members.filter((m) => parseRoles(m.role).includes(key)).length;
    if (holders)
      throw new APIError("BAD_REQUEST", {
        message: `${holders} ${holders === 1 ? "member has" : "members have"} this role. Give them another role first.`,
      });
    // an invitation accepted after the role is gone would leave its member with no access
    const pending = access.organization.invitations.filter(
      (i) => i.status === "pending" && parseRoles(i.role ?? "").includes(key),
    ).length;
    if (pending)
      throw new APIError("BAD_REQUEST", {
        message: `${pending} pending ${pending === 1 ? "invitation uses" : "invitations use"} this role. Cancel ${pending === 1 ? "it" : "them"} first.`,
      });

    await auth.api.deleteOrgRole({
      body: { organizationId: access.organization.id, roleName: key },
      headers: await headers(),
    });

    await recordAudit(access, "role.delete", role.label);
    bustRoles(access.organization.id);
    refresh();
    return apiResponse.single({ message: `Role ${role.label} deleted`, data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
