"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";

import { changePasswordSchema, type ChangePasswordValues } from "@/features/profile/schemas/profile-schema";
import { requireSession } from "@/features/profile/services/require-session";
import { auth } from "@/lib/auth/auth";
import { apiResponse } from "@/utils/response";

export const changePasswordAction = async (values: ChangePasswordValues) => {
  try {
    const { currentPassword, newPassword, revokeOtherSessions } = changePasswordSchema.parse(values);
    await requireSession();

    // a wrong current password comes back as an APIError with a user-facing message;
    // revoking other sessions issues a new session cookie, applied by nextCookies()
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions },
      headers: await headers(),
    });

    refresh();
    return apiResponse.single({
      message: revokeOtherSessions ? "Password changed and other devices signed out" : "Password changed",
      data: null,
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
