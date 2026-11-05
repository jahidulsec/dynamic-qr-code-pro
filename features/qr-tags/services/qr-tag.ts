import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead, mutate } from "@/lib/cache/shared";

/**
 * QR tag service: thin Prisma wrappers wired into the cache layer.
 *
 * Reads are cached and tagged (`qrTags` / `qrTagCount`, plus any
 * `cacheOption.tags`); writes bust both base tags, plus any `revalidateTags`.
 * Writes use `updateTag`, so call them from a server action.
 *
 * Tags are also created through `connectOrCreate` on QR code writes, so those
 * writes pass `cacheTags.qrTags` in their `revalidateTags`.
 */

type RevalidateTags = (string | null | undefined)[];

const writeTags = (revalidateTags: RevalidateTags = []) => [
  cacheTags.qrTags,
  cacheTags.qrTagCount,
  ...revalidateTags,
];

/* ---------------------------------- Reads --------------------------------- */

export const getQrTag = <T extends Prisma.QrTagFindFirstArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrTagFindFirstArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.QrTagGetPayload<T> | null>(
    { model: "qrTag", method: "findFirst", args: args as Prisma.QrTagFindFirstArgs },
    cacheTags.qrTags,
    cacheOption,
  );

export const getQrTags = <T extends Prisma.QrTagFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrTagFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.QrTagGetPayload<T>[]>(
    { model: "qrTag", method: "findMany", args: args as Prisma.QrTagFindManyArgs },
    cacheTags.qrTags,
    cacheOption,
  );

export const countQrTags = (args?: Prisma.QrTagCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "qrTag", method: "count", args: { where: args?.where, cursor: args?.cursor, skip: args?.skip, take: args?.take, orderBy: args?.orderBy } },
    cacheTags.qrTagCount,
    cacheOption,
  );

/* --------------------------------- Writes --------------------------------- */

export const createQrTag = <T extends Prisma.QrTagCreateArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrTagCreateArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.qrTag.create<T>(args), writeTags(revalidateTags));

export const updateQrTag = <T extends Prisma.QrTagUpdateArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrTagUpdateArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.qrTag.update<T>(args), writeTags(revalidateTags));

export const deleteQrTag = <T extends Prisma.QrTagDeleteArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrTagDeleteArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.qrTag.delete<T>(args), writeTags(revalidateTags));
