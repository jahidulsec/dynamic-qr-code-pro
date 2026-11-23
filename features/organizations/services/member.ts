import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead } from "@/lib/cache/shared";

/**
 * Member reads. Rows are written through better-auth's member endpoints, so there are no write wrappers here;
 * callers bust `cacheTags.members`. Role checks read with `{ cache: false }`.
 */

export const getMembers = <T extends Prisma.MemberFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.MemberFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.MemberGetPayload<T>[]>(
    { model: "member", method: "findMany", args: args as Prisma.MemberFindManyArgs },
    cacheTags.members,
    cacheOption,
  );
