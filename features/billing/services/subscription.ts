import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead, mutate } from "@/lib/cache/shared";

/**
 * Subscription service: thin Prisma wrappers wired into the cache layer.
 *
 * One row per organization. Writes are only reachable through admin actions that call
 * requireAdmin(); reads are tagged `subscriptions` / `subscriptionCount`. Entitlement checks read
 * with `{ cache: false }`.
 */

type RevalidateTags = (string | null | undefined)[];

const writeTags = (revalidateTags: RevalidateTags = []) => [
  cacheTags.subscriptions,
  cacheTags.subscriptionCount,
  ...revalidateTags,
];

/* ---------------------------------- Reads --------------------------------- */

export const getSubscription = <T extends Prisma.SubscriptionFindFirstArgs>(
  args: Prisma.SelectSubset<T, Prisma.SubscriptionFindFirstArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.SubscriptionGetPayload<T> | null>(
    { model: "subscription", method: "findFirst", args: args as Prisma.SubscriptionFindFirstArgs },
    cacheTags.subscriptions,
    cacheOption,
  );

export const getSubscriptions = <T extends Prisma.SubscriptionFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.SubscriptionFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.SubscriptionGetPayload<T>[]>(
    { model: "subscription", method: "findMany", args: args as Prisma.SubscriptionFindManyArgs },
    cacheTags.subscriptions,
    cacheOption,
  );

export const countSubscriptions = (args?: Prisma.SubscriptionCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "subscription", method: "count", args: { where: args?.where, cursor: args?.cursor, skip: args?.skip, take: args?.take, orderBy: args?.orderBy } },
    cacheTags.subscriptionCount,
    cacheOption,
  );

/* --------------------------------- Writes --------------------------------- */

export const upsertSubscription = <T extends Prisma.SubscriptionUpsertArgs>(
  args: Prisma.SelectSubset<T, Prisma.SubscriptionUpsertArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.subscription.upsert<T>(args), writeTags(revalidateTags));

export const updateSubscription = <T extends Prisma.SubscriptionUpdateArgs>(
  args: Prisma.SelectSubset<T, Prisma.SubscriptionUpdateArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.subscription.update<T>(args), writeTags(revalidateTags));
