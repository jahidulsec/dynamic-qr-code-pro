import { z } from "zod";

import { ADMIN_ORGANIZATION_TABS, ADMIN_ORGANIZATIONS_PAGE_SIZE } from "@/features/admin/constants";

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
