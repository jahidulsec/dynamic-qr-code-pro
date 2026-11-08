"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { APIError } from "better-auth/api";

import { isOwnerRole } from "@/features/organizations/libs/roles";
import {
  inviteMemberSchema,
  memberRoleSchema,
  type InviteMemberValues,
} from "@/features/organizations/schemas/invite-member-schema";
import { requireManager, requireMembership } from "@/features/organizations/services/get-membership";
import { auth } from "@/lib/auth/auth";
import { cacheTags, organizationTag } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

type Membership = Awaited<ReturnType<typeof requireManager>>;

const bustMembers = (organizationId: string) =>
  [cacheTags.members, cacheTags.memberCount, organizationTag(organizationId)].forEach((tag) => updateTag(tag));

const bustInvitations = (organizationId: string) =>
  [cacheTags.invitations, cacheTags.invitationCount, organizationTag(organizationId)].forEach((tag) => updateTag(tag));

// another member of this organization the viewer may act on; better-auth enforces the same rules
function findManageableMember({ organization, member: viewer }: Membership, memberId: string) {
  const target = organization.members.find((m) => m.id === memberId);
  if (!target) throw new APIError("NOT_FOUND", { message: "Member not found" });
  if (target.id === viewer.id) throw new APIError("BAD_REQUEST", { message: "You can't change your own membership here" });
  if (isOwnerRole(target.role) && !isOwnerRole(viewer.role))
    throw new APIError("FORBIDDEN", { message: "Only owners can manage other owners" });
  return target;
}

function findPendingInvitation({ organization }: Membership, invitationId: string) {
  const invitation = organization.invitations.find((i) => i.id === invitationId && i.status === "pending");
  if (!invitation) throw new APIError("NOT_FOUND", { message: "Invitation not found" });
  return invitation;
}

export const inviteMemberAction = async (organizationSlug: string, values: InviteMemberValues) => {
  try {
    const { email, role } = inviteMemberSchema.parse(values);
    const membership = await requireManager(organizationSlug);
    const { organization, member } = membership;

    if (role === "owner" && !isOwnerRole(member.role))
      throw new APIError("FORBIDDEN", { message: "Only owners can invite another owner" });
    if (organization.members.some((m) => m.user.email.toLowerCase() === email))
      throw new APIError("BAD_REQUEST", { message: `${email} is already a member` });

    // a pending invitation for the same email is replaced (cancelPendingInvitationsOnReInvite)
    await auth.api.createInvitation({
      body: { email, role, organizationId: organization.id },
      headers: await headers(),
    });

    bustInvitations(organization.id);
    refresh();
    return apiResponse.single({ message: `Invitation sent to ${email}`, data: { email } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const resendInvitationAction = async (organizationSlug: string, invitationId: string) => {
  try {
    const membership = await requireManager(organizationSlug);
    const invitation = findPendingInvitation(membership, invitationId);

    // resend keeps the invitation, extends its expiry and emails the same link again
    await auth.api.createInvitation({
      body: {
        email: invitation.email,
        role: invitation.role ?? "member",
        organizationId: membership.organization.id,
        resend: true,
      },
      headers: await headers(),
    });

    bustInvitations(membership.organization.id);
    refresh();
    return apiResponse.single({ message: `Invitation resent to ${invitation.email}`, data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const cancelInvitationAction = async (organizationSlug: string, invitationId: string) => {
  try {
    const membership = await requireManager(organizationSlug);
    const invitation = findPendingInvitation(membership, invitationId);

    await auth.api.cancelInvitation({ body: { invitationId: invitation.id }, headers: await headers() });

    bustInvitations(membership.organization.id);
    refresh();
    return apiResponse.single({ message: `Invitation for ${invitation.email} canceled`, data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const updateMemberRoleAction = async (organizationSlug: string, memberId: string, role: string) => {
  try {
    const nextRole = memberRoleSchema.parse(role);
    const membership = await requireManager(organizationSlug);
    const target = findManageableMember(membership, memberId);

    if (nextRole === "owner" && !isOwnerRole(membership.member.role))
      throw new APIError("FORBIDDEN", { message: "Only owners can make someone an owner" });

    await auth.api.updateMemberRole({
      body: { memberId: target.id, role: nextRole, organizationId: membership.organization.id },
      headers: await headers(),
    });

    bustMembers(membership.organization.id);
    refresh();
    return apiResponse.single({ message: `${target.user.name}'s role was updated`, data: { role: nextRole } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const removeMemberAction = async (organizationSlug: string, memberId: string) => {
  try {
    const membership = await requireManager(organizationSlug);
    const target = findManageableMember(membership, memberId);

    await auth.api.removeMember({
      body: { memberIdOrEmail: target.id, organizationId: membership.organization.id },
      headers: await headers(),
    });

    bustMembers(membership.organization.id);
    refresh();
    return apiResponse.single({ message: `${target.user.name} was removed`, data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const leaveOrganizationAction = async (organizationSlug: string) => {
  try {
    const { organization, member } = await requireMembership(organizationSlug);
    if (isOwnerRole(member.role) && organization.members.filter((m) => isOwnerRole(m.role)).length <= 1)
      throw new APIError("BAD_REQUEST", { message: "Make someone else an owner before you leave" });

    await auth.api.leaveOrganization({ body: { organizationId: organization.id }, headers: await headers() });

    [cacheTags.organizations, cacheTags.members, cacheTags.memberCount, organizationTag(organization.id)].forEach(
      (tag) => updateTag(tag),
    );

    // apiResponse.error rethrows the redirect
    redirect("/organizations");
  } catch (error) {
    return apiResponse.error({ error });
  }
};
