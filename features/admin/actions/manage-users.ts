"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";

import { BAN_DURATIONS } from "@/features/admin/constants";
import { banUserSchema, userIdSchema, type BanUserValues } from "@/features/admin/schemas/manage-users";
import { requireAdmin } from "@/features/admin/services/admin-session";
import { banUser, revokeUserSessions, unbanUser } from "@/features/admin/services/manage-users";
import { apiResponse } from "@/utils/response";

// Each action: requireAdmin → parse → one transaction (the admin audit entry, committed only once the admin
// plugin's `auth.api` call has succeeded) → refresh(). The self / superadmin rules are checked in the service.

const adminActor = (session: Awaited<ReturnType<typeof requireAdmin>>) => ({
  id: session.user.id,
  name: session.user.name,
});

/** Bans the user and signs them out everywhere; they can't sign in until the ban ends or is lifted. */
export const banUserAction = async (userId: string, values: BanUserValues) => {
  try {
    const session = await requireAdmin();
    const id = userIdSchema.parse(userId);
    const { reason, duration } = banUserSchema.parse(values);

    const user = await banUser({
      userId: id,
      admin: adminActor(session),
      headers: await headers(),
      reason,
      expiresIn: BAN_DURATIONS[duration].seconds,
    });

    refresh();
    return apiResponse.single({ message: `${user.name || user.email} was banned and signed out`, data: { id: user.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const unbanUserAction = async (userId: string) => {
  try {
    const session = await requireAdmin();
    const user = await unbanUser({ userId: userIdSchema.parse(userId), admin: adminActor(session), headers: await headers() });

    refresh();
    return apiResponse.single({ message: `${user.name || user.email} was unbanned`, data: { id: user.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const revokeUserSessionsAction = async (userId: string) => {
  try {
    const session = await requireAdmin();
    const user = await revokeUserSessions({
      userId: userIdSchema.parse(userId),
      admin: adminActor(session),
      headers: await headers(),
    });

    refresh();
    return apiResponse.single({ message: `${user.name || user.email} was signed out everywhere`, data: { id: user.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
