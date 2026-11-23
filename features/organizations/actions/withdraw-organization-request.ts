"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";
import { z } from "zod";

import { isOwnerRole } from "@/features/organizations/libs/roles";
import { getSession } from "@/features/organizations/services/get-organization";
import { getMembers } from "@/features/organizations/services/member";
import { deleteOrganizationIf } from "@/features/organizations/services/organization";
import { organizationTag } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const organizationIdSchema = z.string().trim().min(1).max(64);

/**
 * Lets an owner take back a request that hasn't been approved. The normal delete goes through `requirePermission`,
 * which refuses organizations that aren't active, so this one checks ownership and status itself.
 */
export const withdrawOrganizationRequestAction = async (organizationId: string) => {
  try {
    const id = organizationIdSchema.parse(organizationId);
    const session = await getSession();
    if (!session) throw new APIError("UNAUTHORIZED", { message: "Please sign in again" });

    // fresh: a role change must take effect immediately
    const [member] = await getMembers(
      { where: { organizationId: id, userId: session.user.id }, select: { role: true }, take: 1 },
      { cache: false },
    );
    if (!member) throw new APIError("NOT_FOUND", { message: "Organization not found" });
    if (!isOwnerRole(member.role))
      throw new APIError("FORBIDDEN", { message: "Only owners can withdraw a request" });

    // conditional, so an approval that lands first wins and the now-active organization is kept
    const deleted = await deleteOrganizationIf(id, { status: { in: ["PENDING", "REJECTED"] } }, [organizationTag(id)]);
    if (!deleted)
      throw new APIError("BAD_REQUEST", { message: "Only pending or rejected requests can be withdrawn" });

    refresh();
    return apiResponse.single({ message: "Request withdrawn", data: { id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
