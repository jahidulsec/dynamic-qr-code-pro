import { createAccessControl } from "better-auth/plugins/access";

/**
 * The permission catalogue: every resource and action a role can be granted.
 *
 * Client-safe and the single source of truth for RBAC. The organization plugin (server and
 * client) is configured from it, server actions check it through `requirePermission`, the UI
 * hides controls with `useAccess().can`, and the Roles page renders it. Every action listed
 * here must be enforced somewhere; add an action here only together with its check.
 *
 * `organization`, `member`, `invitation` and `ac` are checked by better-auth's own endpoints too.
 */
export const statements = {
  organization: ["update", "delete"],
  member: ["update", "delete"],
  invitation: ["create", "cancel"],
  ac: ["create", "read", "update", "delete"],
  qr: ["create", "update", "status", "trash", "restore", "delete", "export"],
  tag: ["create", "update", "delete"],
  report: ["read"],
  audit: ["read"],
} as const;

export type Resource = keyof typeof statements;
export type Action<R extends Resource = Resource> = (typeof statements)[R][number];

/** A set of grants, e.g. `{ qr: ["create", "update"] }`; plain data, safe to serialize. */
export type Permissions = { [R in Resource]?: readonly Action<R>[] };

export const ac = createAccessControl(statements);

/* ------------------------------- System roles ------------------------------ */

export const SYSTEM_ROLES = ["owner", "admin", "member", "viewer"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const isSystemRole = (role: string): role is SystemRole => (SYSTEM_ROLES as readonly string[]).includes(role);

// fixed in code: they can't be edited or deleted, and custom roles can't take their names
export const SYSTEM_ROLE_PERMISSIONS = {
  owner: statements,
  admin: {
    organization: ["update"],
    member: ["update", "delete"],
    invitation: ["create", "cancel"],
    ac: ["create", "read", "update", "delete"],
    qr: ["create", "update", "status", "trash", "restore", "delete", "export"],
    tag: ["create", "update", "delete"],
    report: ["read"],
    audit: ["read"],
  },
  member: {
    ac: ["read"],
    qr: ["create", "update", "status", "trash", "restore", "export"],
    tag: ["create"],
    report: ["read"],
  },
  viewer: {
    ac: ["read"],
    qr: ["export"],
    report: ["read"],
  },
} as const satisfies Record<SystemRole, Permissions>;

export const SYSTEM_ROLE_DETAILS: Record<SystemRole, { label: string; description: string }> = {
  owner: { label: "Owner", description: "Full control, including deleting the organization and managing owners." },
  admin: { label: "Admin", description: "Manages members, roles, tags and settings, and can permanently delete QR codes." },
  member: { label: "Member", description: "Creates and edits QR codes, adds tags and views reports." },
  viewer: { label: "Viewer", description: "Views QR codes and reports, and downloads exports. Can't change anything." },
};

// handed to the organization plugin so better-auth's endpoints enforce the same rules
export const roles = {
  owner: ac.newRole(SYSTEM_ROLE_PERMISSIONS.owner),
  admin: ac.newRole(SYSTEM_ROLE_PERMISSIONS.admin),
  member: ac.newRole(SYSTEM_ROLE_PERMISSIONS.member),
  viewer: ac.newRole(SYSTEM_ROLE_PERMISSIONS.viewer),
};

/* ------------------------------ Catalogue labels ------------------------------ */

type CatalogueGroup<R extends Resource = Resource> = {
  resource: R;
  label: string;
  actions: { action: Action<R>; label: string; sensitive?: boolean }[];
};

// what the role editor and permission matrix show; `sensitive` grants control the organization itself
export const PERMISSION_CATALOGUE: CatalogueGroup[] = [
  {
    resource: "qr",
    label: "QR codes",
    actions: [
      { action: "create", label: "Create QR codes" },
      { action: "update", label: "Edit QR codes" },
      { action: "status", label: "Pause and resume" },
      { action: "trash", label: "Move to trash" },
      { action: "restore", label: "Restore from trash" },
      { action: "delete", label: "Delete permanently" },
      { action: "export", label: "Download images and CSV exports" },
    ],
  } satisfies CatalogueGroup<"qr">,
  {
    resource: "tag",
    label: "Department tags",
    actions: [
      { action: "create", label: "Create tags" },
      { action: "update", label: "Rename tags" },
      { action: "delete", label: "Delete tags" },
    ],
  } satisfies CatalogueGroup<"tag">,
  {
    resource: "report",
    label: "Reports",
    actions: [{ action: "read", label: "View scan reports" }],
  } satisfies CatalogueGroup<"report">,
  {
    resource: "invitation",
    label: "Invitations",
    actions: [
      { action: "create", label: "Invite members" },
      { action: "cancel", label: "Cancel invitations" },
    ],
  } satisfies CatalogueGroup<"invitation">,
  {
    resource: "member",
    label: "Members",
    actions: [
      { action: "update", label: "Change member roles" },
      { action: "delete", label: "Remove members" },
    ],
  } satisfies CatalogueGroup<"member">,
  {
    resource: "ac",
    label: "Roles",
    actions: [
      { action: "read", label: "View roles" },
      { action: "create", label: "Create roles", sensitive: true },
      { action: "update", label: "Edit roles", sensitive: true },
      { action: "delete", label: "Delete roles", sensitive: true },
    ],
  } satisfies CatalogueGroup<"ac">,
  {
    resource: "audit",
    label: "Audit log",
    actions: [{ action: "read", label: "View the audit log" }],
  } satisfies CatalogueGroup<"audit">,
  {
    resource: "organization",
    label: "Organization",
    actions: [
      { action: "update", label: "Edit name and URL", sensitive: true },
      { action: "delete", label: "Delete the organization", sensitive: true },
    ],
  } satisfies CatalogueGroup<"organization">,
];

/* --------------------------------- Checks --------------------------------- */

/** Every role an organization knows, by key: the system roles plus its custom roles. */
export type RoleDefinitions = Record<string, Permissions>;

/** Splits a stored role value ("admin,member") into role keys, as better-auth does. */
export const parseRoleList = (role: string | null | undefined) =>
  (role ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

const grants = (definition: Permissions | undefined, resource: Resource, action: string) =>
  !!(definition?.[resource] as readonly string[] | undefined)?.includes(action);

/**
 * Whether a member with `role` holds every requested permission. A member with several roles
 * holds the union of their grants, matching better-auth's per-permission escalation checks.
 */
export function can(definitions: RoleDefinitions, role: string, permissions: Permissions) {
  const keys = parseRoleList(role);
  return Object.entries(permissions).every(([resource, actions]) =>
    (actions ?? []).every((action) => keys.some((key) => grants(definitions[key], resource as Resource, action))),
  );
}

/** The combined grants of `role`, e.g. to send to the client. */
export function effectivePermissions(definitions: RoleDefinitions, role: string): Permissions {
  const result: Record<string, Action[]> = {};
  for (const group of PERMISSION_CATALOGUE)
    for (const { action } of group.actions)
      if (can(definitions, role, { [group.resource]: [action] })) (result[group.resource] ??= []).push(action);
  return result as Permissions;
}

/** The grants in `permissions` that `holder` doesn't have; empty when it may hand them all out. */
export function missingPermissions(holder: Permissions, permissions: Permissions) {
  const missing: string[] = [];
  for (const [resource, actions] of Object.entries(permissions))
    for (const action of actions ?? []) if (!grants(holder, resource as Resource, action)) missing.push(`${resource}:${action}`);
  return missing;
}

/**
 * Keeps only known resources and actions, deduplicated and in catalogue order, so stored or
 * submitted permission JSON can never grant something the catalogue doesn't define.
 */
export function normalizePermissions(input: unknown): Permissions {
  if (!input || typeof input !== "object") return {};
  const source = input as Record<string, unknown>;
  const result: Record<string, string[]> = {};
  for (const [resource, actions] of Object.entries(statements)) {
    const requested = source[resource];
    if (!Array.isArray(requested)) continue;
    const kept = (actions as readonly string[]).filter((action) => requested.includes(action));
    if (kept.length) result[resource] = kept;
  }
  return result as Permissions;
}

export const countPermissions = (permissions: Permissions) =>
  Object.values(permissions).reduce((total, actions) => total + (actions?.length ?? 0), 0);
