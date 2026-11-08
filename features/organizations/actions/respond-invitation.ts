"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { cacheTags, organizationTag } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const invitationIdSchema = z.string().trim().min(1, "Invitation not found");

const bust = (organizationId: string, ...tags: string[]) =>
  [cacheTags.invitations, cacheTags.invitationCount, organizationTag(organizationId), ...tags].forEach((tag) =>
    updateTag(tag),
  );

// better-auth checks the invitation is pending, unexpired and addressed to the signed-in user
export const acceptInvitationAction = async (invitationId: string) => {
  try {
    const id = invitationIdSchema.parse(invitationId);
    const requestHeaders = await headers();

    const invitation = await auth.api.getInvitation({ query: { id }, headers: requestHeaders });
    await auth.api.acceptInvitation({ body: { invitationId: id }, headers: requestHeaders });

    bust(invitation.organizationId, cacheTags.organizations, cacheTags.members, cacheTags.memberCount);

    // apiResponse.error rethrows the redirect
    redirect(`/${invitation.organizationSlug}`);
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const rejectInvitationAction = async (invitationId: string) => {
  try {
    const id = invitationIdSchema.parse(invitationId);
    const requestHeaders = await headers();

    const invitation = await auth.api.getInvitation({ query: { id }, headers: requestHeaders });
    await auth.api.rejectInvitation({ body: { invitationId: id }, headers: requestHeaders });

    bust(invitation.organizationId);
    redirect("/organizations");
  } catch (error) {
    return apiResponse.error({ error });
  }
};
