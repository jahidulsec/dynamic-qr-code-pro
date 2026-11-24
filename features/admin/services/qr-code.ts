import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead } from "@/lib/cache/shared";

// not organization-scoped: only reachable through loaders that call requireAdmin()

/* ---------------------------------- Reads --------------------------------- */

export const countQrCodes = (args?: Prisma.QrCodeCountArgs, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    // a count `select` returns per-field counts, not a number; keep this to plain counts
    { model: "qrCode", method: "count", args: { where: args?.where } },
    cacheTags.qrCodeCount,
    cacheOption,
  );
