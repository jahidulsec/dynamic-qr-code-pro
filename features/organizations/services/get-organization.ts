import { cache } from "react";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { auth } from "@/lib/auth/auth";

// cached per request so the layout and page share one lookup
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export const listOrganizations = cache(async () => auth.api.listOrganizations({ headers: await headers() }));

// null when the organization doesn't exist or the user isn't a member
export const getOrganizationBySlug = cache(async (slug: string) =>
  auth.api
    .getFullOrganization({ query: { organizationSlug: slug }, headers: await headers() })
    .catch(() => null),
);

// the signed-in user's pending, unexpired invitations; empty when the lookup is rejected (e.g. unverified email)
export const listPendingInvitations = cache(async () => {
  const invitations = await auth.api
    .listUserInvitations({ headers: await headers() })
    .catch((error: unknown) => {
      if (error instanceof APIError) return [];
      throw error;
    });
  const now = Date.now();
  return invitations.filter((invitation) => new Date(invitation.expiresAt).getTime() > now);
});
