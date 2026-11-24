"use server";

import type { Prisma } from "@/generated/prisma/client";
import { describeAdminAuditMetadata } from "@/features/admin/libs/admin-audit-details";
import { adminAuditLogSearchParamsSchema } from "@/features/admin/schemas/admin-query-schema";
import { countAdminAuditLogs, getAdminAuditActors, getAdminAuditLogs } from "@/features/admin/services/admin-audit-log";
import { requireAdmin } from "@/features/admin/services/admin-session";
import type { SearchParams } from "@/types/params";
import { apiResponse } from "@/utils/response";

const newestFirst = [{ createdAt: "desc" }, { id: "desc" }] satisfies Prisma.AdminAuditLogOrderByWithRelationInput[];

/**
 * /admin/audit-log, straight from its URL search params: filtered by action, actor and target type, newest
 * first. Read fresh, like the dashboard's activity list, so an action shows up here the moment it commits.
 */
export const getAdminAuditLog = async (searchParams: SearchParams) => {
  try {
    const query = adminAuditLogSearchParamsSchema.parse(searchParams);
    await requireAdmin();
    const fresh = { cache: false } as const;

    const where: Prisma.AdminAuditLogWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.actor ? { actorId: query.actor } : {}),
      ...(query.target ? { targetType: query.target } : {}),
    };

    const [count, rows, actors] = await Promise.all([
      countAdminAuditLogs({ where }, fresh),
      getAdminAuditLogs(
        {
          where,
          select: {
            id: true,
            actorName: true,
            action: true,
            targetType: true,
            targetLabel: true,
            metadata: true,
            createdAt: true,
          },
          orderBy: newestFirst,
          skip: (query.page - 1) * query.size,
          take: query.size,
        },
        fresh,
      ),
      getAdminAuditActors(fresh),
    ]);

    const items = rows.map(({ metadata, ...entry }) => ({
      ...entry,
      detail: describeAdminAuditMetadata(metadata, entry.action),
    }));

    return apiResponse.single({
      data: {
        items,
        count,
        query,
        actors: actors
          .flatMap(({ actorId, actorName }) => (actorId ? [{ id: actorId, name: actorName }] : []))
          .sort((a, b) => a.name.localeCompare(b.name)),
      },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
