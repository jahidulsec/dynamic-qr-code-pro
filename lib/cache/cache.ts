import { toArray } from "@/utils/format";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { cacheTags } from "./cache-tags";

export type CacheTag = (typeof cacheTags)[keyof typeof cacheTags];

/** Inline `cacheLife` profile, in seconds. */
type CacheLifeProfile = {
  stale?: number;
  revalidate?: number;
  expire?: number;
};

/**
 * Revalidation presets for `use cache` scopes, as `cacheLife` profiles.
 *
 * - `realtime` – near live data, refreshed every 10s (never prerendered)
 * - `short`    – good for list/detail queries
 * - `medium`   – data that changes a few times an hour
 * - `long`     – mostly static data (config, lookups)
 * - `day`      – rarely changing reference data
 * - `off`      – cache until a tag is revalidated
 *
 * `stale` is how long the client router may reuse the result without asking
 * the server; `expire` is how long an unused entry may be served before the
 * next request has to wait for a fresh read.
 */
export const cachePresets = {
  realtime: { stale: 0, revalidate: 10, expire: 60 },
  short: { stale: 60, revalidate: 60, expire: 60 * 60 },
  medium: { stale: 60 * 5, revalidate: 60 * 5, expire: 60 * 60 * 24 },
  long: { stale: 60 * 5, revalidate: 60 * 60, expire: 60 * 60 * 24 },
  day: { stale: 60 * 5, revalidate: 60 * 60 * 24, expire: 60 * 60 * 24 * 7 },
  off: "max",
} as const satisfies Record<string, CacheLifeProfile | "max">;

export type CachePreset = keyof typeof cachePresets;

export type ServerCacheOptions = {
  /** Extra cache tags (e.g. a record id) used with `updateTag` to bust this entry. */
  tags?: string | string[];
  /** A named preset or a raw seconds value / `false`. Defaults to `"realtime"`. */
  revalidate?: CachePreset | number | false;
  /** Skip caching entirely and call the underlying read fresh. Defaults to `true`. */
  cache?: boolean;
};

/** Serializable cache settings, resolved outside and applied inside a `use cache` scope. */
export type ResolvedCacheOptions = {
  tags: string[];
  life: CacheLifeProfile | "max";
};

/**
 * Merge a service's own tag with the optional per-call `cacheOption`. The
 * result always starts with `baseTag` so entries are bustable per model.
 */
export const resolveCacheOptions = (
  baseTag: string,
  cacheOption?: ServerCacheOptions,
): ResolvedCacheOptions => {
  const { tags, revalidate = "realtime" } = cacheOption ?? {};

  return {
    tags: [baseTag, ...toArray(tags)],
    life:
      typeof revalidate === "string"
        ? cachePresets[revalidate]
        : revalidate === false
          ? "max"
          : { revalidate, expire: Math.max(revalidate * 2, 60) },
  };
};

/**
 * Tag the current `use cache` scope and set its lifetime. Must be called
 * inside a function that starts with the `"use cache"` directive.
 */
export const applyCacheOptions = ({ tags, life }: ResolvedCacheOptions) => {
  cacheTag(...tags);
  // `cacheLife` is overloaded per profile name, so narrow before calling it
  if (typeof life === "string") cacheLife(life);
  else cacheLife(life);
};

/**
 * Run a write, then bust every provided tag (falsy entries are skipped so
 * callers can spread an optional `revalidateTags` list straight in).
 *
 * @example
 * return mutate(
 *   () => prisma.qrCode.update({ where: { id }, data }),
 *   [cacheTags.qrCodes, qrCodeTag(id), ...(revalidateTags ?? [])],
 * );
 */
export const mutate = async <Result>(
  fn: () => Promise<Result>,
  tags: (string | null | undefined)[],
): Promise<Result> => {
  const res = await fn();
  tags.forEach(tag => tag && updateTag(tag));
  return res;
};
