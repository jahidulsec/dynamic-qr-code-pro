import "server-only";

// Public, server-only API of the organizations feature. Import from "@/features/organizations/server" only.
export { AcceptInvitation, AcceptInvitationSkeleton } from "./components/accept-invitation";
export { OrganizationList, OrganizationListSkeleton } from "./components/organization-list";
export { getOrganizationBySlug, getSession, listOrganizations } from "./services/get-organization";

// access control: every loader and action authorizes through these
export {
  getAccess,
  getMembership,
  hasPermission,
  requireMembership,
  requirePermission,
  type Access,
} from "./services/get-membership";

// settings pages
export { AuditLogTable } from "./components/audit-log-table";
export { InvitationTable } from "./components/invitation-table";
export { InviteMemberDialog } from "./components/invite-member-dialog";
export { MemberTable } from "./components/member-table";
export { OrganizationDangerZone } from "./components/organization-danger-zone";
export { OrganizationGeneralForm } from "./components/organization-general-form";
export { RoleFormDialog } from "./components/role-form-dialog";
export { RolePermissionMatrix, RoleSummary } from "./components/role-permission-matrix";
export { SettingsNav } from "./components/settings-nav";
export { AUDIT_PAGE_SIZE, getAuditLog } from "./libs/audit-log";
export { isOwnerRole, parseRoles } from "./libs/roles";
export { toInvitationRows, type InvitationRow, type MemberRow } from "./libs/settings-types";
