import type { Prisma } from "@/generated/prisma/client";
import { SUPERADMIN_ROLE } from "@/lib/auth/admin-permissions";

/** The admin plugin stores roles as a comma-separated list. */
export const isSuperadmin = (role: string | null | undefined) =>
  !!role && role.split(",").some((key) => key.trim() === SUPERADMIN_ROLE);

/**
 * A ban in effect. The admin plugin leaves `banned = true` after `banExpires` passes and clears it at the
 * user's next sign-in, so an expired ban reads as no ban.
 */
export const isBanActive = (user: { banned: boolean | null; banExpires: Date | null }, now = new Date()) =>
  !!user.banned && (!user.banExpires || user.banExpires > now);

export function buildAdminUserWhere({ search }: { search?: string }): Prisma.UserWhereInput {
  const term = search?.trim();
  return term ? { OR: [{ name: { contains: term } }, { email: { contains: term } }] } : {};
}

export const adminUserListSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  role: true,
  banned: true,
  banReason: true,
  banExpires: true,
  createdAt: true,
  _count: { select: { members: true } },
} satisfies Prisma.UserSelect;

/** Spec 04: an admin can't ban themselves or another superadmin. The UI hides the action; the service refuses it. */
export const cannotBanReason = (admin: { id: string }, target: { id: string; role: string | null }) => {
  if (target.id === admin.id) return "You can't ban yourself";
  if (isSuperadmin(target.role)) return "Superadmins can't be banned from the panel";
  return null;
};
