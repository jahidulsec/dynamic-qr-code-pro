import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead } from "@/lib/cache/shared";

/**
 * Custom role reads. Rows are written through better-auth's role endpoints (`auth.api.createOrgRole`
 * and friends), so there are no write wrappers here; callers bust `cacheTags.organizationRoles`.
 */

export const getOrganizationRoles = <T extends Prisma.OrganizationRoleFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.OrganizationRoleFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.OrganizationRoleGetPayload<T>[]>(
    { model: "organizationRole", method: "findMany", args: args as Prisma.OrganizationRoleFindManyArgs },
    cacheTags.organizationRoles,
    cacheOption,
  );
