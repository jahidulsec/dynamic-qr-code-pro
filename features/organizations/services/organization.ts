import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import { cacheTags } from "@/lib/cache/cache-tags";
import { mutate } from "@/lib/cache/shared";

/**
 * Organization writes that must be conditional on status, which better-auth's endpoints can't express.
 * Everything else goes through `auth.api`. Writes use `updateTag`, so call them from a server action.
 */

type RevalidateTags = (string | null | undefined)[];

/**
 * Delete one organization, only if it still matches `where` (e.g. a status condition), so the check and the delete
 * are atomic. Returns whether it was deleted. Members, invitations, roles, audit entries, QR codes and the
 * subscription cascade in the database. Sessions that had it active are cleared, as better-auth's own delete does.
 */
export const deleteOrganizationIf = (
  id: string,
  where: Prisma.OrganizationWhereInput,
  revalidateTags: RevalidateTags = [],
) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const { count } = await tx.organization.deleteMany({ where: { ...where, id } });
        if (!count) return false;

        await tx.session.updateMany({ where: { activeOrganizationId: id }, data: { activeOrganizationId: null } });
        return true;
      }),
    [
      cacheTags.organizations,
      cacheTags.organizationCount,
      cacheTags.members,
      cacheTags.memberCount,
      cacheTags.invitations,
      cacheTags.invitationCount,
      cacheTags.organizationRoles,
      ...revalidateTags,
    ],
  );
