import { z } from "zod";

import {
  ADMIN_AUDIT_PAGE_SIZE,
  ADMIN_ORGANIZATION_TABS,
  ADMIN_ORGANIZATIONS_PAGE_SIZE,
  ADMIN_USERS_PAGE_SIZE,
} from "@/features/admin/constants";
import { ADMIN_AUDIT_ACTIONS, ADMIN_AUDIT_TARGET_TYPES, type AdminAuditAction } from "@/features/admin/libs/admin-audit-actions";

export type AdminOrganizationTab = (typeof ADMIN_ORGANIZATION_TABS)[number];

// a single-valued URL param; repeated (array) or missing values become undefined
const urlParam = z.string().optional().catch(undefined);

/**
 * /admin/organizations?status=&q=&plan=&expiring=7&page=&size=
 * Anything invalid falls back instead of failing the page. A missing `status` stays undefined:
 * the loader picks Pending when there are pending requests, otherwise All.
 */
export const adminOrganizationsSearchParamsSchema = z
  .object({ page: urlParam, size: urlParam, q: urlParam, status: urlParam, plan: urlParam, expiring: urlParam })
  .transform((params) =>
    z
      .object({
        page: z.coerce.number().int().positive().catch(1),
        size: z.coerce.number().int().positive().max(100).catch(ADMIN_ORGANIZATIONS_PAGE_SIZE),
        search: z.string().trim().max(100).optional().catch(undefined),
        status: z.enum(ADMIN_ORGANIZATION_TABS).optional().catch(undefined),
        plan: z.string().trim().max(32).optional().catch(undefined),
        // only "7" means anything; the window is fixed
        expiring: z.literal("7").optional().catch(undefined).transform((value) => value === "7"),
      })
      .parse({ ...params, search: params.q || undefined, plan: params.plan || undefined }),
  );

export type AdminOrganizationsQuery = z.output<typeof adminOrganizationsSearchParamsSchema>;

/** /admin/users?q=&page=&size=, searched by name or email. Anything invalid falls back instead of failing the page. */
export const adminUsersSearchParamsSchema = z
  .object({ page: urlParam, size: urlParam, q: urlParam })
  .transform((params) =>
    z
      .object({
        page: z.coerce.number().int().positive().catch(1),
        size: z.coerce.number().int().positive().max(100).catch(ADMIN_USERS_PAGE_SIZE),
        search: z.string().trim().max(100).optional().catch(undefined),
      })
      .parse({ ...params, search: params.q || undefined }),
  );

export type AdminUsersQuery = z.output<typeof adminUsersSearchParamsSchema>;

const adminAuditActionKeys = Object.keys(ADMIN_AUDIT_ACTIONS) as [AdminAuditAction, ...AdminAuditAction[]];

/**
 * /admin/audit-log?action=&actor=&target=&page=&size=, newest first. Anything invalid falls back instead of
 * failing the page; `actor` is an admin's user id.
 */
export const adminAuditLogSearchParamsSchema = z
  .object({ page: urlParam, size: urlParam, action: urlParam, actor: urlParam, target: urlParam })
  .transform((params) =>
    z
      .object({
        page: z.coerce.number().int().positive().catch(1),
        size: z.coerce.number().int().positive().max(100).catch(ADMIN_AUDIT_PAGE_SIZE),
        action: z.enum(adminAuditActionKeys).optional().catch(undefined),
        actor: z.string().trim().min(1).max(191).optional().catch(undefined),
        target: z.enum(ADMIN_AUDIT_TARGET_TYPES).optional().catch(undefined),
      })
      .parse(params),
  );

export type AdminAuditLogQuery = z.output<typeof adminAuditLogSearchParamsSchema>;
