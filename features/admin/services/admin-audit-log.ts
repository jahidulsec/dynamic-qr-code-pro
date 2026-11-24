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
