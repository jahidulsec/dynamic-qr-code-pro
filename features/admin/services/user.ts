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
