export const ADMIN_HOME_PATH = "/admin";

// public; outside the panel guard
export const ADMIN_LOGIN_PATH = "/admin/login";

// where "Back to app" goes
export const APP_HOME_PATH = "/organizations";

/** One name per admin page, shared by the sidebar, page heading and document title. */
export const ADMIN_PAGE_TITLES = {
  dashboard: "Dashboard",
  organizations: "Organizations",
  plans: "Plans",
  users: "Users",
  auditLog: "Audit log",
} as const;

export const ADMIN_PATHS = {
  dashboard: ADMIN_HOME_PATH,
  organizations: `${ADMIN_HOME_PATH}/organizations`,
  plans: `${ADMIN_HOME_PATH}/plans`,
  users: `${ADMIN_HOME_PATH}/users`,
  auditLog: `${ADMIN_HOME_PATH}/audit-log`,
} as const;

export const ADMIN_ORGANIZATIONS_PAGE_SIZE = 20;

// the "expiring soon" window, shared with the dashboard tile (spec 04)
export const ADMIN_EXPIRING_DAYS = 7;

/** Status tabs on /admin/organizations, in display order. */
export const ADMIN_ORGANIZATION_TABS = ["pending", "active", "suspended", "rejected", "all"] as const;
