import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead, mutate } from "@/lib/cache/shared";

/** Audit log service: reads are cached and tagged `auditLogs` / `auditLogCount`; writes bust both. */

export const getAuditLogs = <T extends Prisma.AuditLogFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.AuditLogFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.AuditLogGetPayload<T>[]>(
    { model: "auditLog", method: "findMany", args: args as Prisma.AuditLogFindManyArgs },
    cacheTags.auditLogs,
    cacheOption,
  );

export const countAuditLogs = (args: { where?: Prisma.AuditLogWhereInput }, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>({ model: "auditLog", method: "count", args: { where: args.where } }, cacheTags.auditLogCount, cacheOption);

export const createAuditLog = <T extends Prisma.AuditLogCreateArgs>(args: Prisma.SelectSubset<T, Prisma.AuditLogCreateArgs>) =>
  mutate(() => prisma.auditLog.create<T>(args), [cacheTags.auditLogs, cacheTags.auditLogCount]);
