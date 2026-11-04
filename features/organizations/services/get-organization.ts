import { cache } from "react";
import { headers } from "next/headers";

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
