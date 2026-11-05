import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead } from "@/lib/cache/shared";

/**
 * QR scan service: thin Prisma wrappers wired into the cache layer.
 *
 * Reads are cached and tagged (`qrScans` / `qrScanCount`, plus any
 * `cacheOption.tags`). Grouped and raw analytics queries aren't supported by
 * `cachedRead`, so they live in `features/qr/libs/qr-analytics.ts`.
 */

/* ---------------------------------- Reads --------------------------------- */

export const getQrScans = <T extends Prisma.QrScanFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.QrScanFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.QrScanGetPayload<T>[]>(
    { model: "qrScan", method: "findMany", args: args as Prisma.QrScanFindManyArgs },
    cacheTags.qrScans,
    cacheOption,
  );

export const countQrScans = (args?: Prisma.QrScanCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "qrScan", method: "count", args: { where: args?.where, cursor: args?.cursor, skip: args?.skip, take: args?.take, orderBy: args?.orderBy } },
    cacheTags.qrScanCount,
    cacheOption,
  );

/* --------------------------------- Writes --------------------------------- */

/**
 * Store one scan and bump the code's `scanCount` together.
 *
 * This runs from `after()` on the public redirect, not from a server action,
 * so it can't call `updateTag`. Scan and QR reads use the `realtime` preset, so
 * they pick the new scan up within seconds anyway.
 */
export const recordQrScan = (data: Prisma.QrScanUncheckedCreateInput) =>
  prisma.$transaction([
    prisma.qrScan.create({ data, select: { id: true } }),
    prisma.qrCode.update({ where: { id: data.qrCodeId }, data: { scanCount: { increment: 1 } }, select: { id: true } }),
  ]);
