"use server";

import { headers } from "next/headers";

import { requireSession } from "@/features/profile/services/require-session";
import { auth } from "@/lib/auth/auth";
import { apiResponse } from "@/utils/response";

// the signed-in user's sessions, most recently active first, without their tokens
export const getUserSessions = async () => {
  try {
    const current = await requireSession();
    const sessions = await auth.api.listSessions({ headers: await headers() });

    const data = sessions
      .map(({ id, userAgent, ipAddress, createdAt, updatedAt, expiresAt }) => ({
        id,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        expiresAt: new Date(expiresAt),
        current: id === current.session.id,
      }))
      .sort((a, b) => Number(b.current) - Number(a.current) || b.updatedAt.getTime() - a.updatedAt.getTime());

    return apiResponse.multi({ data, count: data.length });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
