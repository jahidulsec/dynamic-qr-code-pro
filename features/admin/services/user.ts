import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead } from "@/lib/cache/shared";

/* ---------------------------------- Reads --------------------------------- */

export const getUser = <T extends Prisma.UserFindUniqueArgs>(
  args: Prisma.SelectSubset<T, Prisma.UserFindUniqueArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.UserGetPayload<T> | null>(
    { model: "user", method: "findUnique", args: args as Prisma.UserFindUniqueArgs },
    cacheTags.users,
    cacheOption,
  );

// not organization-scoped: only reachable through loaders that call requireAdmin()
export const countUsers = (args?: Prisma.UserCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "user", method: "count", args: { where: args?.where } },
    cacheTags.userCount,
    cacheOption,
  );

// not organization-scoped: only reachable through loaders that call requireAdmin()
export const getUsers = <T extends Prisma.UserFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.UserFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.UserGetPayload<T>[]>(
    { model: "user", method: "findMany", args: args as Prisma.UserFindManyArgs },
    cacheTags.users,
    cacheOption,
  );
