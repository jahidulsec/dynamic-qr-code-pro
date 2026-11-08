// Client-safe role helpers. The permission catalogue and system roles live in "@/lib/auth/permissions".
import {
  effectivePermissions,
  isSystemRole,
  missingPermissions,
  parseRoleList,
  SYSTEM_ROLE_DETAILS,
  SYSTEM_ROLE_PERMISSIONS,
  SYSTEM_ROLES,
  type Permissions,
  type RoleDefinitions,
} from "@/lib/auth/permissions";

/** A role as the UI sees it: a system role or one of the organization's custom roles. Serializable. */
export type RoleInfo = {
  key: string;
  label: string;
  description: string | null;
  system: boolean;
  permissions: Permissions;
};

export const SYSTEM_ROLE_INFOS: RoleInfo[] = SYSTEM_ROLES.map((key) => ({
  key,
  ...SYSTEM_ROLE_DETAILS[key],
  system: true,
  permissions: SYSTEM_ROLE_PERMISSIONS[key],
}));

export const toRoleDefinitions = (roles: RoleInfo[]): RoleDefinitions =>
  Object.fromEntries(roles.map((role) => [role.key, role.permissions]));

// a member can hold several roles, stored comma-separated
export const parseRoles = parseRoleList;

// "field-team" → "Field team", for a role whose label isn't known here
const humanize = (key: string) => {
  const words = key.replace(/[-_]+/g, " ").trim();
  return words ? words[0].toUpperCase() + words.slice(1) : key;
};

export const roleLabel = (key: string, roles?: RoleInfo[]) =>
  roles?.find((role) => role.key === key)?.label ??
  (isSystemRole(key) ? SYSTEM_ROLE_DETAILS[key].label : humanize(key));

export const isOwnerRole = (role: string) => parseRoles(role).includes("owner");

/** Turns a label into a role key that is safe to store comma-separated in `member.role`. */
export const roleKeyFromLabel = (label: string) =>
  label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

/* --------------------------- Delegation rules --------------------------- */
// Shared by the server actions and the settings UI so both agree on what a member may hand out.

type Viewer = { role: string; permissions: Permissions };

/** Why `viewer` can't give out `role`, or null when they can. You can only grant what you hold. */
export function cannotAssignReason(viewer: Viewer, role: RoleInfo) {
  if (role.key === "owner" && !isOwnerRole(viewer.role)) return "Only owners can make someone an owner";
  if (missingPermissions(viewer.permissions, role.permissions).length)
    return "You can only give out roles whose permissions you have yourself";
  return null;
}

/** Why `viewer` can't change or remove a member holding `targetRole`, or null when they can. */
export function cannotManageReason(viewer: Viewer, targetRole: string, definitions: RoleDefinitions) {
  if (isOwnerRole(targetRole) && !isOwnerRole(viewer.role)) return "Only owners can manage other owners";
  if (missingPermissions(viewer.permissions, effectivePermissions(definitions, targetRole)).length)
    return "This member has access you don't have";
  return null;
}
