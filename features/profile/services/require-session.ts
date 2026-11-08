import { APIError } from "better-auth/api";

import { getSession } from "@/features/organizations/server";

// resolves the signed-in user, or throws a user-facing error
export async function requireSession() {
  const session = await getSession();
  if (!session) throw new APIError("UNAUTHORIZED", { message: "Please sign in again" });
  return session;
}
