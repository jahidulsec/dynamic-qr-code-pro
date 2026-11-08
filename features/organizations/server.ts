import "server-only";

// Public, server-only API of the organizations feature. Import from "@/features/organizations/server" only.
export { OrganizationList, OrganizationListSkeleton } from "./components/organization-list";
export { getOrganizationBySlug, getSession, listOrganizations } from "./services/get-organization";
export { getMembership } from "./services/get-membership";

// settings pages
export { InvitationTable } from "./components/invitation-table";
export { InviteMemberDialog } from "./components/invite-member-dialog";
export { MemberTable } from "./components/member-table";
export { OrganizationDangerZone } from "./components/organization-danger-zone";
export { OrganizationGeneralForm } from "./components/organization-general-form";
export { RolePermissionMatrix, RoleSummary } from "./components/role-permission-matrix";
export { SettingsNav } from "./components/settings-nav";
export {
  isManagerRole,
  isOwnerRole,
  ORGANIZATION_ROLES,
  parseRoles,
  type OrganizationRole,
} from "./libs/roles";
export { toInvitationRows, type InvitationRow, type MemberRow } from "./libs/settings-types";
