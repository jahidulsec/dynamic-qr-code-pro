import { cache } from "react";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { auth, type Session } from "@/lib/auth/auth";
import { SUPERADMIN_ROLE } from "@/lib/auth/admin-permissions";

export type AdminSession = Session;

// a fresh lookup, never the cookie cache, so a demoted or banned admin loses access on their next request
const getFreshSession = cache(async () =>
  auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } }),
);

// only the admin plugin's `superadmin` counts; an organization `member.role = "admin"` grants nothing here
const isPlatformAdmin = (session: Session) => session.user.role === SUPERADMIN_ROLE && !session.user.banned;

/** The signed-in platform admin's session, or null. Shared within the request. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const session = await getFreshSession();
  return session && isPlatformAdmin(session) ? session : null;
});

/** Every admin loader and action calls this itself; layouts don't run for server actions. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getFreshSession();
  if (!session) throw new APIError("UNAUTHORIZED", { message: "Please sign in again" });
  if (!isPlatformAdmin(session)) throw new APIError("FORBIDDEN", { message: "This account doesn't have admin access" });
  return session;
}
