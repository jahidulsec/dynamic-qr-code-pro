import "server-only";

// Public, server-only API of the admin feature. Import from "@/features/admin/server" only.

/* ---------------------------------- Guard ---------------------------------- */
export { getAdminSession, requireAdmin, type AdminSession } from "./services/admin-session";
