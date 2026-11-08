"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { APIError } from "better-auth/api";

import { recordAudit } from "@/features/organizations/libs/audit";
import {
  createOrganizationSchema,
  type CreateOrganizationValues,
} from "@/features/organizations/schemas/create-organization-schema";
import { requirePermission } from "@/features/organizations/services/get-membership";
import { auth } from "@/lib/auth/auth";
import { cacheTags, organizationTag } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

export const updateOrganizationAction = async (organizationSlug: string, values: CreateOrganizationValues) => {
  try {
    const { name, slug } = createOrganizationSchema.parse(values);
    const access = await requirePermission(organizationSlug, { organization: ["update"] }, "You can't edit the organization");
    const { organization } = access;

    // better-auth re-checks the role and rejects a slug another organization already uses
    const updated = await auth.api.updateOrganization({
      body: { organizationId: organization.id, data: { name, slug } },
      headers: await headers(),
    });

    [cacheTags.organizations, organizationTag(organization.id)].forEach((tag) => updateTag(tag));
    await recordAudit(access, "organization.update", name, {
      from: `${organization.name} (${organization.slug})`,
      to: `${name} (${updated?.slug ?? slug})`,
    });

    // the old URL no longer resolves; apiResponse.error rethrows the redirect
    const nextSlug = updated?.slug ?? slug;
    if (nextSlug !== organizationSlug) redirect(`/${nextSlug}/settings/general`);

    refresh();
    return apiResponse.single({ message: "Organization updated", data: { name, slug: nextSlug } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const deleteOrganizationAction = async (organizationSlug: string, confirmation: string) => {
  try {
    const { organization } = await requirePermission(
      organizationSlug,
      { organization: ["delete"] },
      "You can't delete the organization",
    );
    if (confirmation !== organization.slug)
      throw new APIError("BAD_REQUEST", { message: "Type the organization URL to confirm" });

    // members, invitations, QR codes, tags and scans cascade in the database
    await auth.api.deleteOrganization({
      body: { organizationId: organization.id },
      headers: await headers(),
    });

    [
      cacheTags.organizations,
      cacheTags.organizationCount,
      cacheTags.members,
      cacheTags.memberCount,
      cacheTags.invitations,
      cacheTags.invitationCount,
      cacheTags.qrCodes,
      cacheTags.qrCodeCount,
      cacheTags.qrTags,
      cacheTags.qrTagCount,
      cacheTags.qrScans,
      cacheTags.qrScanCount,
      cacheTags.organizationRoles,
      cacheTags.auditLogs,
      cacheTags.auditLogCount,
      organizationTag(organization.id),
    ].forEach((tag) => updateTag(tag));

    redirect("/organizations");
  } catch (error) {
    return apiResponse.error({ error });
  }
};
