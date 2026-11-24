import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead, mutate } from "@/lib/cache/shared";

/**
 * Plan service: thin Prisma wrappers wired into the cache layer.
 *
 * Plans aren't organization-scoped; writes are only reachable through admin actions that call
 * requireAdmin(). Reads are tagged `plans` / `planCount`; writes bust both, plus `subscriptions`,
 * since an organization's entitlements are read through its plan.
 */

type RevalidateTags = (string | null | undefined)[];

const writeTags = (revalidateTags: RevalidateTags = []) => [
  cacheTags.plans,
  cacheTags.planCount,
  cacheTags.subscriptions,
  ...revalidateTags,
];

/* ---------------------------------- Reads --------------------------------- */

export const getPlan = <T extends Prisma.PlanFindFirstArgs>(
  args: Prisma.SelectSubset<T, Prisma.PlanFindFirstArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.PlanGetPayload<T> | null>(
    { model: "plan", method: "findFirst", args: args as Prisma.PlanFindFirstArgs },
    cacheTags.plans,
    cacheOption,
  );

export const getPlans = <T extends Prisma.PlanFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.PlanFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.PlanGetPayload<T>[]>(
    { model: "plan", method: "findMany", args: args as Prisma.PlanFindManyArgs },
    cacheTags.plans,
    cacheOption,
  );

export const countPlans = (args?: Prisma.PlanCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "plan", method: "count", args: { where: args?.where, cursor: args?.cursor, skip: args?.skip, take: args?.take, orderBy: args?.orderBy } },
    cacheTags.planCount,
    cacheOption,
  );

/* --------------------------------- Writes --------------------------------- */

export const createPlan = <T extends Prisma.PlanCreateArgs>(
  args: Prisma.SelectSubset<T, Prisma.PlanCreateArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.plan.create<T>(args), writeTags(revalidateTags));

export const updatePlan = <T extends Prisma.PlanUpdateArgs>(
  args: Prisma.SelectSubset<T, Prisma.PlanUpdateArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.plan.update<T>(args), writeTags(revalidateTags));
