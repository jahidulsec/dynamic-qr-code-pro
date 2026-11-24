import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead } from "@/lib/cache/shared";

/**
 * Invitation reads. Rows are written through better-auth's invitation endpoints, so there are no write wrappers
 * here; callers bust `cacheTags.invitations`. Limit checks read with `{ cache: false }`.
 */

export const countInvitations = (args: { where?: Prisma.InvitationWhereInput }, cacheOption?: ServerCacheOptions) =>
  cachedRead<number>(
    { model: "invitation", method: "count", args: { where: args.where } },
    cacheTags.invitationCount,
    cacheOption,
  );
