// Public, client-safe API of the admin feature. Import from "@/features/admin" only.
// The guard (getAdminSession, requireAdmin) is server-only and lives in "./server".

/* -------------------------------- Components ------------------------------- */
export { AdminLoginForm } from "./components/admin-login-form";
export { AdminPageHeader } from "./components/admin-page-header";
export { AdminPlaceholder } from "./components/admin-placeholder";
export { AdminSidebar } from "./components/admin-sidebar";

/* ----------------------------- Actions & loaders ---------------------------- */
export { getPendingOrganizationCount } from "./libs/admin-organizations";

/* --------------------------- Schemas, constants, types --------------------------- */
export { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH, ADMIN_PAGE_TITLES } from "./constants";
