import { APIError } from "better-auth/api";

import { getOrganizationBySlug, getSession } from "@/features/organizations/server";

export const ADMIN_ROLES = ["owner", "admin"];

// resolves the organization for the signed-in member, or throws a user-facing error;
// every QR query must then be scoped by the returned organization id
export async function requireOrganization(organizationSlug: string) {
  const session = await getSession();
  if (!session) throw new APIError("UNAUTHORIZED", { message: "Please sign in again" });

  // null when the organization doesn't exist or the user isn't a member
  const organization = await getOrganizationBySlug(organizationSlug);
  if (!organization) throw new APIError("NOT_FOUND", { message: "Organization not found" });

  const member = organization.members.find((member) => member.userId === session.user.id);
  if (!member) throw new APIError("FORBIDDEN", { message: "You're not a member of this organization" });

  return { session, organization, role: member.role };
}

export const isAdminRole = (role: string) => role.split(",").some((r) => ADMIN_ROLES.includes(r.trim()));
