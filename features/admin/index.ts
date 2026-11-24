// Public, client-safe API of the admin feature. Import from "@/features/admin" only.
// The guard (getAdminSession, requireAdmin) is server-only and lives in "./server".

/* -------------------------------- Components ------------------------------- */
export { AdminLoginForm } from "./components/admin-login-form";
export { AdminOrganizationDetail } from "./components/organization-detail";
export { AdminOrganizationFilters } from "./components/organization-filters";
export { AdminOrganizationTable } from "./components/organization-table";
export { AdminPageHeader } from "./components/admin-page-header";
export { AdminPlaceholder } from "./components/admin-placeholder";
export { AdminSidebar } from "./components/admin-sidebar";

/* ----------------------------- Actions & loaders ---------------------------- */
export {
  approveOrganizationAction,
  reactivateOrganizationAction,
  rejectOrganizationAction,
  suspendOrganizationAction,
} from "./actions/review-organization";
export { getAdminOrganization, getAdminOrganizations, getPendingOrganizationCount } from "./libs/admin-organizations";

/* --------------------------- Schemas, constants, types --------------------------- */
export { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH, ADMIN_PAGE_TITLES } from "./constants";
export {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_TARGET_TYPES,
  type AdminAuditAction,
  type AdminAuditTargetType,
} from "./libs/admin-audit-actions";
export {
  APPROVE_SUBSCRIPTION_STATUSES,
  REVIEW_REASON_MAX,
  REVIEW_REASON_MIN,
  approveOrganizationSchema,
  reviewReasonSchema,
  type ApproveOrganizationValues,
  type ReviewReasonValues,
} from "./schemas/review-organization";
