import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead } from "@/lib/cache/shared";

// only reachable through loaders that call requireAdmin(); entries are written by writeAdminAudit inside a transaction

/* ---------------------------------- Reads --------------------------------- */

export const getAdminAuditLogs = <T extends Prisma.AdminAuditLogFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.AdminAuditLogFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.AdminAuditLogGetPayload<T>[]>(
    { model: "adminAuditLog", method: "findMany", args: args as Prisma.AdminAuditLogFindManyArgs },
    cacheTags.adminAuditLogs,
    cacheOption,
  );

export const countAdminAuditLogs = (args?: Prisma.AdminAuditLogCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "adminAuditLog", method: "count", args: { where: args?.where } },
    cacheTags.adminAuditLogCount,
    cacheOption,
  );

/** Every admin who has an entry, once each, under the name on their latest entry. Deleted accounts (no actorId) are left out. */
export const getAdminAuditActors = (cacheOption?: ServerCacheOptions) =>
  cachedRead<{ actorId: string | null; actorName: string }[]>(
    {
      model: "adminAuditLog",
      method: "findMany",
      args: {
        where: { actorId: { not: null } },
        distinct: ["actorId"],
        orderBy: [{ actorId: "asc" }, { createdAt: "desc" }],
        select: { actorId: true, actorName: true },
      },
    },
    cacheTags.adminAuditLogs,
    cacheOption,
  );
