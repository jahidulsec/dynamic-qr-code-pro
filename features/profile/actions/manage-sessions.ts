"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { APIError } from "better-auth/api";

import { sessionIdSchema } from "@/features/profile/schemas/profile-schema";
import { requireSession } from "@/features/profile/services/require-session";
import { auth } from "@/lib/auth/auth";
import { apiResponse } from "@/utils/response";

// the client only ever sees session ids; tokens are looked up here so they never reach the page
export const revokeSessionAction = async (id: string) => {
  try {
    const sessionId = sessionIdSchema.parse(id);
    const current = await requireSession();
    if (sessionId === current.session.id)
      throw new APIError("BAD_REQUEST", { message: "Use Log out to end this device's session" });

    const requestHeaders = await headers();
    // listSessions only returns the signed-in user's own sessions
    const sessions = await auth.api.listSessions({ headers: requestHeaders });
    const target = sessions.find((session) => session.id === sessionId);
    if (!target) throw new APIError("NOT_FOUND", { message: "Session not found or already signed out" });

    await auth.api.revokeSession({ body: { token: target.token }, headers: requestHeaders });

    refresh();
    return apiResponse.single({ message: "Device signed out", data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const revokeOtherSessionsAction = async () => {
  try {
    await requireSession();
    await auth.api.revokeOtherSessions({ headers: await headers() });

    refresh();
    return apiResponse.single({ message: "Other devices signed out", data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
