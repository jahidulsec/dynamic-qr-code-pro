import { APIError } from "better-auth/api";

import { isManagerRole } from "@/features/organizations/libs/roles";
import { getOrganizationBySlug, getSession } from "@/features/organizations/services/get-organization";

// the signed-in user's membership in an organization, or null; reuses the per-request lookups
export async function getMembership(organizationSlug: string) {
  const [session, organization] = await Promise.all([getSession(), getOrganizationBySlug(organizationSlug)]);
  if (!session || !organization) return null;

  const member = organization.members.find((member) => member.userId === session.user.id);
  if (!member) return null;

  return { session, organization, member };
}

// the signed-in user's membership, or a user-facing error; for server actions
export async function requireMembership(organizationSlug: string) {
  const membership = await getMembership(organizationSlug);
  if (!membership) throw new APIError("NOT_FOUND", { message: "Organization not found" });
  return membership;
}

// as requireMembership, but only for owners and admins
export async function requireManager(organizationSlug: string, message = "Only owners and admins can manage members") {
  const membership = await requireMembership(organizationSlug);
  if (!isManagerRole(membership.member.role)) throw new APIError("FORBIDDEN", { message });
  return membership;
}
