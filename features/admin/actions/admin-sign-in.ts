"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

import { ADMIN_HOME_PATH } from "@/features/admin/constants";
import { getUser } from "@/features/admin/services/user";
import { signInSchema, type SignInValues } from "@/features/auth";
import { auth } from "@/lib/auth/auth";
import { SUPERADMIN_ROLE } from "@/lib/auth/admin-permissions";
import { apiResponse } from "@/utils/response";

// one message for unknown emails, wrong passwords and non-admins, so the form reveals nothing
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password, or this account doesn't have admin access";

export const adminSignInAction = async (values: SignInValues) => {
  try {
    const { email, password } = signInSchema.parse(values);

    // checked before signing in: signInEmail sets the session cookie, so a non-admin must never reach it
    const user = await getUser(
      { where: { email: email.toLowerCase() }, select: { role: true, banned: true, emailVerified: true } },
      { cache: false },
    );
    if (!user || user.role !== SUPERADMIN_ROLE || user.banned)
      throw new APIError("UNAUTHORIZED", { message: INVALID_CREDENTIALS_MESSAGE });

    // admins don't take the normal verify-email redirect
    if (!user.emailVerified) throw new APIError("FORBIDDEN", { message: "Verify your email before signing in" });

    try {
      await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
    } catch (error) {
      if (error instanceof APIError && error.body?.code === "INVALID_EMAIL_OR_PASSWORD")
        throw new APIError("UNAUTHORIZED", { message: INVALID_CREDENTIALS_MESSAGE });
      throw error;
    }

    // apiResponse.error rethrows the redirect
    redirect(ADMIN_HOME_PATH);
  } catch (error) {
    return apiResponse.error({ error });
  }
};
