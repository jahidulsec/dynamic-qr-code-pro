// Client-safe role catalogue for the settings UI. Keep in sync with the organization plugin's roles.
export const ORGANIZATION_ROLES = ["owner", "admin", "member"] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const ROLE_DETAILS: Record<OrganizationRole, { label: string; description: string }> = {
  owner: { label: "Owner", description: "Full control, including deleting the organization and managing owners." },
  admin: { label: "Admin", description: "Manages members, tags and settings, and can permanently delete QR codes." },
  member: { label: "Member", description: "Creates and edits QR codes and views reports." },
};

// a member can hold several roles, stored comma-separated
export const parseRoles = (role: string) =>
  role
    .split(",")
    .map((r) => r.trim())
    .filter((r): r is OrganizationRole => (ORGANIZATION_ROLES as readonly string[]).includes(r));

export const roleLabel = (role: string) => ROLE_DETAILS[role as OrganizationRole]?.label ?? role;

export const hasAnyRole = (role: string, roles: readonly OrganizationRole[]) =>
  parseRoles(role).some((r) => roles.includes(r));

export const isOwnerRole = (role: string) => hasAnyRole(role, ["owner"]);
export const isManagerRole = (role: string) => hasAnyRole(role, ["owner", "admin"]);

type Permission = { action: string; roles: readonly OrganizationRole[] };

// what each role may do, as enforced by the server actions; shown read-only on the Roles page
export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: "Organization",
    permissions: [
      { action: "View settings", roles: ["owner", "admin", "member"] },
      { action: "Edit name and URL", roles: ["owner", "admin"] },
      { action: "Delete organization", roles: ["owner"] },
    ],
  },
  {
    label: "Members",
    permissions: [
      { action: "View members", roles: ["owner", "admin", "member"] },
      { action: "Invite members", roles: ["owner", "admin"] },
      { action: "Change roles and remove members", roles: ["owner", "admin"] },
      { action: "Manage owners", roles: ["owner"] },
    ],
  },
  {
    label: "QR codes",
    permissions: [
      { action: "Create and edit QR codes", roles: ["owner", "admin", "member"] },
      { action: "Move to trash and restore", roles: ["owner", "admin", "member"] },
      { action: "Delete permanently", roles: ["owner", "admin"] },
    ],
  },
  {
    label: "Department tags",
    permissions: [
      { action: "Create tags", roles: ["owner", "admin", "member"] },
      { action: "Rename and delete tags", roles: ["owner", "admin"] },
    ],
  },
];
