/** One name per page, shared by the sidebar, breadcrumb, page heading and document title. */
export const PAGE_TITLES = {
  dashboard: "Dashboard",
  check: "Click to Check",
  tags: "Department Tags",
  trash: "Trash",
  reports: "Graph Reports",
  settings: "Settings",
  general: "General",
  members: "Members",
  roles: "Roles",
  auditLog: "Audit log",
} as const;

/** Dashboard footer links. Point these at the real pages once they exist. */
export const FOOTER_LINKS = [
  { label: "Support", href: "/support" },
  { label: "System Status", href: "/status" },
  { label: "Careers", href: "/careers" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Report Security Issues", href: "/security" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Preferences", href: "/cookies" },
] as const;
