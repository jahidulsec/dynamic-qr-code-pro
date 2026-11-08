import { getOrganizationBySlug, getSession } from "@/features/organizations/services/get-organization";

// the signed-in user's membership in an organization, or null; reuses the per-request lookups
export async function getMembership(organizationSlug: string) {
  const [session, organization] = await Promise.all([getSession(), getOrganizationBySlug(organizationSlug)]);
  if (!session || !organization) return null;

  const member = organization.members.find((member) => member.userId === session.user.id);
  if (!member) return null;

  return { session, organization, member };
}
