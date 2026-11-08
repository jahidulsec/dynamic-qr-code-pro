"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { APIError } from "better-auth/api";

import { recordAudit } from "@/features/organizations/libs/audit";
import { cannotAssignReason, cannotManageReason, isOwnerRole, roleLabel } from "@/features/organizations/libs/roles";
import {
  inviteMemberSchema,
  memberRoleSchema,
  type InviteMemberValues,
} from "@/features/organizations/schemas/invite-member-schema";
import { requireMembership, requirePermission, type Access } from "@/features/organizations/services/get-membership";
import { auth } from "@/lib/auth/auth";
import { cacheTags, organizationTag } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const bustMembers = (organizationId: string) =>
  [cacheTags.members, cacheTags.memberCount, organizationTag(organizationId)].forEach((tag) => updateTag(tag));

const bustInvitations = (organizationId: string) =>
  [cacheTags.invitations, cacheTags.invitationCount, organizationTag(organizationId)].forEach((tag) => updateTag(tag));

const viewerOf = (access: Access) => ({ role: access.member.role, permissions: access.permissions });

// another member of this organization the viewer may act on; better-auth re-checks the owner rules
function findManageableMember(access: Access, memberId: string) {
  const target = access.organization.members.find((m) => m.id === memberId);
  if (!target) throw new APIError("NOT_FOUND", { message: "Member not found" });
  if (target.id === access.member.id) throw new APIError("BAD_REQUEST", { message: "You can't change your own membership here" });

  const reason = cannotManageReason(viewerOf(access), target.role, access.definitions);
  if (reason) throw new APIError("FORBIDDEN", { message: reason });
  return target;
}

// a role of this organization the viewer may hand out
function findAssignableRole(access: Access, roleKey: string) {
  const role = access.roles.find((r) => r.key === roleKey);
  if (!role) throw new APIError("BAD_REQUEST", { message: "That role doesn't exist in this organization" });

  const reason = cannotAssignReason(viewerOf(access), role);
  if (reason) throw new APIError("FORBIDDEN", { message: reason });
  return role;
}

function findPendingInvitation({ organization }: Access, invitationId: string) {
  const invitation = organization.invitations.find((i) => i.id === invitationId && i.status === "pending");
  if (!invitation) throw new APIError("NOT_FOUND", { message: "Invitation not found" });
  return invitation;
}

export const inviteMemberAction = async (organizationSlug: string, values: InviteMemberValues) => {
  try {
    const { email, role } = inviteMemberSchema.parse(values);
    const access = await requirePermission(organizationSlug, { invitation: ["create"] }, "You can't invite members");
    const { organization } = access;
    const assigned = findAssignableRole(access, role);

    if (organization.members.some((m) => m.user.email.toLowerCase() === email))
      throw new APIError("BAD_REQUEST", { message: `${email} is already a member` });

    // a pending invitation for the same email is replaced (cancelPendingInvitationsOnReInvite)
    await auth.api.createInvitation({
      body: { email, role: assigned.key, organizationId: organization.id },
      headers: await headers(),
    });

    await recordAudit(access, "invitation.create", email, { role: assigned.label });
    bustInvitations(organization.id);
    refresh();
    return apiResponse.single({ message: `Invitation sent to ${email}`, data: { email } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const resendInvitationAction = async (organizationSlug: string, invitationId: string) => {
  try {
    const access = await requirePermission(organizationSlug, { invitation: ["create"] }, "You can't invite members");
    const invitation = findPendingInvitation(access, invitationId);
    // re-issuing grants the role again, so the viewer must still be allowed to give it out
    const assigned = findAssignableRole(access, invitation.role ?? "member");

    // resend keeps the invitation, extends its expiry and emails the same link again
    await auth.api.createInvitation({
      body: { email: invitation.email, role: assigned.key, organizationId: access.organization.id, resend: true },
      headers: await headers(),
    });

    await recordAudit(access, "invitation.resend", invitation.email, { role: assigned.label });
    bustInvitations(access.organization.id);
    refresh();
    return apiResponse.single({ message: `Invitation resent to ${invitation.email}`, data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const cancelInvitationAction = async (organizationSlug: string, invitationId: string) => {
  try {
    const access = await requirePermission(organizationSlug, { invitation: ["cancel"] }, "You can't cancel invitations");
    const invitation = findPendingInvitation(access, invitationId);

    await auth.api.cancelInvitation({ body: { invitationId: invitation.id }, headers: await headers() });

    await recordAudit(access, "invitation.cancel", invitation.email);
    bustInvitations(access.organization.id);
    refresh();
    return apiResponse.single({ message: `Invitation for ${invitation.email} canceled`, data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const updateMemberRoleAction = async (organizationSlug: string, memberId: string, role: string) => {
  try {
    const nextRole = memberRoleSchema.parse(role);
    const access = await requirePermission(organizationSlug, { member: ["update"] }, "You can't change member roles");
    const target = findManageableMember(access, memberId);
    const assigned = findAssignableRole(access, nextRole);

    await auth.api.updateMemberRole({
      body: { memberId: target.id, role: assigned.key, organizationId: access.organization.id },
      headers: await headers(),
    });

    await recordAudit(access, "member.role.update", target.user.name, {
      from: target.role
        .split(",")
        .map((key) => roleLabel(key.trim(), access.roles))
        .join(", "),
      to: assigned.label,
    });
    bustMembers(access.organization.id);
    refresh();
    return apiResponse.single({ message: `${target.user.name} is now ${assigned.label}`, data: { role: assigned.key } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const removeMemberAction = async (organizationSlug: string, memberId: string) => {
  try {
    const access = await requirePermission(organizationSlug, { member: ["delete"] }, "You can't remove members");
    const target = findManageableMember(access, memberId);

    await auth.api.removeMember({
      body: { memberIdOrEmail: target.id, organizationId: access.organization.id },
      headers: await headers(),
    });

    await recordAudit(access, "member.remove", target.user.name, { email: target.user.email });
    bustMembers(access.organization.id);
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
