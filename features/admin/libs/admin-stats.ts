"use server";

import { buildAdminOrganizationWhere, describeAdminAuditMetadata } from "@/features/admin/libs/admin-organization-query";
import { getAdminAuditLogs } from "@/features/admin/services/admin-audit-log";
import { requireAdmin } from "@/features/admin/services/admin-session";
import { countOrganizations, getOrganizations } from "@/features/admin/services/organization";
import { countQrCodes } from "@/features/admin/services/qr-code";
import { countQrScans } from "@/features/admin/services/qr-scan";
import { countUsers } from "@/features/admin/services/user";
import { isOwnerRole } from "@/features/organizations/server";
import { apiResponse } from "@/utils/response";

const DAY_MS = 24 * 60 * 60 * 1000;
const NEW_USERS_DAYS = 7;
const SCAN_WINDOW_DAYS = 30;
const PENDING_LIMIT = 5;
const ACTIVITY_LIMIT = 10;
// "owner" can sit in a comma-separated role list; the exact match is checked after the read
const OWNER_CANDIDATES = 5;

/**
 * /admin: the six stat tiles, the 5 oldest pending requests and the latest admin activity.
 * Every read is fresh: the dashboard is the review queue's entry point, so its pending count must
 * match the Pending tab straight after an approval.
 */
export const getAdminDashboard = async () => {
  try {
    await requireAdmin();
    const fresh = { cache: false } as const;
    const now = new Date();

    const [pending, active, users, newUsers, qrCodes, scans, expiring, pendingRows, activity] = await Promise.all([
      countOrganizations({ where: { status: "PENDING" } }, fresh),
      countOrganizations({ where: { status: "ACTIVE" } }, fresh),
      countUsers(undefined, fresh),
      countUsers({ where: { createdAt: { gte: new Date(now.getTime() - NEW_USERS_DAYS * DAY_MS) } } }, fresh),
      countQrCodes({ where: { deletedAt: null } }, fresh),
      countQrScans({ where: { scannedAt: { gte: new Date(now.getTime() - SCAN_WINDOW_DAYS * DAY_MS) } } }, fresh),
      // the list's own filter (F11), so the tile and the list it links to always agree
      countOrganizations({ where: buildAdminOrganizationWhere({ expiring: true }, now) }, fresh),
      getOrganizations(
        {
          where: { status: "PENDING" },
          // whoever asked first is reviewed first, like the Pending tab
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          take: PENDING_LIMIT,
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            members: {
              where: { role: { contains: "owner" } },
              orderBy: { createdAt: "asc" },
              take: OWNER_CANDIDATES,
              select: { role: true, user: { select: { name: true, email: true } } },
            },
          },
        },
        fresh,
      ),
      getAdminAuditLogs(
        {
          select: { id: true, actorName: true, action: true, targetLabel: true, metadata: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: ACTIVITY_LIMIT,
        },
        fresh,
      ),
    ]);

    return apiResponse.single({
      data: {
        stats: { pending, active, users, newUsers, qrCodes, scans, expiring },
        pending: pendingRows.map(({ members, ...organization }) => ({
          ...organization,
          requester: members.find((member) => isOwnerRole(member.role))?.user ?? null,
        })),
        activity: activity.map((entry) => ({
          id: entry.id,
          actorName: entry.actorName,
          action: entry.action,
          targetLabel: entry.targetLabel,
          detail: describeAdminAuditMetadata(entry.metadata),
          createdAt: entry.createdAt,
        })),
      },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
