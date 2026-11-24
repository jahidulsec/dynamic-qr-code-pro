import { APIError } from "better-auth/api";

import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import { ADMIN_AUDIT_TAGS, writeAdminAudit } from "@/features/admin/libs/admin-audit";
import { cannotBanReason } from "@/features/admin/libs/admin-user-query";
import { auth } from "@/lib/auth/auth";
import { mutate } from "@/lib/cache/shared";
import { cacheTags } from "@/lib/cache/cache-tags";

// not organization-scoped: only reachable through actions that call requireAdmin()

type Admin = { id: string; name: string };

type UserChange = {
  userId: string;
  admin: Admin;
  /** the acting admin's request headers; better-auth's admin endpoints check the session they carry */
  headers: Headers;
};

/**
 * Each change runs inside a Prisma transaction that re-reads the target, writes the admin audit entry and then
 * calls the admin plugin through `auth.api`. better-auth writes on its own connection, so it can't join the
 * transaction; instead the entry commits only once that call has succeeded, and rolls back if it throws.
 * Nothing here locks the target's rows, or better-auth's update of them would wait on this transaction.
 */
const TRANSACTION_OPTIONS = { timeout: 10_000 };

const writeTags = [cacheTags.users, ...ADMIN_AUDIT_TAGS];

const targetSelect = { id: true, name: true, email: true, role: true, banned: true } satisfies Prisma.UserSelect;

const findTarget = async (tx: Prisma.TransactionClient, userId: string) => {
  const user = await tx.user.findUnique({ where: { id: userId }, select: targetSelect });
  if (!user) throw new APIError("NOT_FOUND", { message: "User not found" });
  return user;
};

const label = (user: { name: string; email: string }) => user.name || user.email;

/** Bans the user and, through the admin plugin, deletes every session they have. */
export const banUser = ({ userId, admin, headers, reason, expiresIn }: UserChange & { reason: string; expiresIn: number | null }) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const target = await findTarget(tx, userId);
        const refused = cannotBanReason(admin, target);
        if (refused) throw new APIError("FORBIDDEN", { message: refused });

        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
        await writeAdminAudit(tx, {
          actor: admin,
          action: "user.ban",
          targetType: "user",
          targetId: target.id,
          targetLabel: label(target),
          metadata: { email: target.email, reason, expires: expiresAt ? expiresAt.toISOString() : null },
        });

        // no expiry and no plugin default: the ban lasts until an admin lifts it
        await auth.api.banUser({
          body: { userId: target.id, banReason: reason, ...(expiresIn ? { banExpiresIn: expiresIn } : {}) },
          headers,
        });
        return target;
      }, TRANSACTION_OPTIONS),
    writeTags,
  );

export const unbanUser = ({ userId, admin, headers }: UserChange) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const target = await findTarget(tx, userId);
        if (!target.banned) throw new APIError("CONFLICT", { message: `${label(target)} isn't banned` });

        await writeAdminAudit(tx, {
          actor: admin,
          action: "user.unban",
          targetType: "user",
          targetId: target.id,
          targetLabel: label(target),
          metadata: { email: target.email },
        });

        await auth.api.unbanUser({ body: { userId: target.id }, headers });
        return target;
      }, TRANSACTION_OPTIONS),
    writeTags,
  );

/** Signs the user out everywhere. Not offered for yourself: that would end the admin's own session. */
export const revokeUserSessions = ({ userId, admin, headers }: UserChange) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const target = await findTarget(tx, userId);
        if (target.id === admin.id)
          throw new APIError("BAD_REQUEST", { message: "Sign out from your account menu to end your own sessions" });

        const sessions = await tx.session.count({ where: { userId: target.id, expiresAt: { gt: new Date() } } });
        await writeAdminAudit(tx, {
          actor: admin,
          action: "user.sessions.revoke",
          targetType: "user",
          targetId: target.id,
          targetLabel: label(target),
          metadata: { email: target.email, sessions },
        });

        await auth.api.revokeUserSessions({ body: { userId: target.id }, headers });
        return { ...target, sessions };
      }, TRANSACTION_OPTIONS),
    writeTags,
  );
