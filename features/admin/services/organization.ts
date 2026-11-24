import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead } from "@/lib/cache/shared";

// not organization-scoped: only reachable through loaders that call requireAdmin()

/* ---------------------------------- Reads --------------------------------- */

export const countOrganizations = (args?: Prisma.OrganizationCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "organization", method: "count", args: { where: args?.where } },
    cacheTags.organizationCount,
    cacheOption,
  );

export const getOrganizations = <T extends Prisma.OrganizationFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.OrganizationFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.OrganizationGetPayload<T>[]>(
    { model: "organization", method: "findMany", args: args as Prisma.OrganizationFindManyArgs },
    cacheTags.organizations,
    cacheOption,
  );

export const getOrganization = <T extends Prisma.OrganizationFindUniqueArgs>(
  args: Prisma.SelectSubset<T, Prisma.OrganizationFindUniqueArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.OrganizationGetPayload<T> | null>(
    { model: "organization", method: "findUnique", args: args as Prisma.OrganizationFindUniqueArgs },
    cacheTags.organizations,
    cacheOption,
  );
