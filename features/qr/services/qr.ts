import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead, mutate } from "@/lib/cache/shared";

/**
 * QR code service: thin Prisma wrappers wired into the cache layer.
 *
 * Reads are cached and tagged (`qrCodes` / `qrCodeCount`, plus any
 * `cacheOption.tags`); writes bust both base tags, plus any `revalidateTags`.
 * Writes use `updateTag`, so call them from a server action.
 */

type RevalidateTags = (string | null | undefined)[];

const writeTags = (revalidateTags: RevalidateTags = []) => [
  cacheTags.qrCodes,
  cacheTags.qrCodeCount,
  ...revalidateTags,
];

/* ---------------------------------- Reads --------------------------------- */

export const getQrCode = <T extends Prisma.QrCodeFindFirstArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrCodeFindFirstArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.QrCodeGetPayload<T> | null>(
    { model: "qrCode", method: "findFirst", args: args as Prisma.QrCodeFindFirstArgs },
    cacheTags.qrCodes,
    cacheOption,
  );

export const getQrCodes = <T extends Prisma.QrCodeFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrCodeFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.QrCodeGetPayload<T>[]>(
    { model: "qrCode", method: "findMany", args: args as Prisma.QrCodeFindManyArgs },
    cacheTags.qrCodes,
    cacheOption,
  );

export const countQrCodes = (args?: Prisma.QrCodeCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "qrCode", method: "count", args: { where: args?.where, cursor: args?.cursor, skip: args?.skip, take: args?.take, orderBy: args?.orderBy } },
    cacheTags.qrCodeCount,
    cacheOption,
  );

/* --------------------------------- Writes --------------------------------- */

export const createQrCode = <T extends Prisma.QrCodeCreateArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrCodeCreateArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.qrCode.create<T>(args), writeTags(revalidateTags));

export const updateQrCode = <T extends Prisma.QrCodeUpdateArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrCodeUpdateArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.qrCode.update<T>(args), writeTags(revalidateTags));

export const updateQrCodes = (args: Prisma.QrCodeUpdateManyArgs, revalidateTags?: RevalidateTags) =>
  mutate(() => prisma.qrCode.updateMany(args), writeTags(revalidateTags));

export const deleteQrCode =<T extends Prisma.QrCodeDeleteArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrCodeDeleteArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.qrCode.delete<T>(args), writeTags(revalidateTags));
