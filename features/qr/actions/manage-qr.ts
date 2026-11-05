"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";
import { z } from "zod";

import { QR_QUOTA } from "@/features/qr/constants";
import { liveQrWhere } from "@/features/qr/libs/qr-query";
import { countQrCodes, deleteQrCode, updateQrCode } from "@/features/qr/services/qr";
import { isAdminRole, requireOrganization } from "@/features/qr/services/require-organization";
import { cacheTags } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const idSchema = z.number().int().positive();

const notFound = () => new APIError("NOT_FOUND", { message: "QR code not found" });

// P2025: the scoped where matched no row (wrong organization, or not in the expected trash state)
const orNotFound = (error: unknown): never => {
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") throw notFound();
  throw error;
};

// tag counts include only codes outside the trash, so trash moves bust them too
const revalidateTags = [cacheTags.qrTags];

export const setQrStatusAction = async (organizationSlug: string, id: number, status: "ACTIVE" | "PAUSED") => {
  try {
    const qrId = idSchema.parse(id);
    const nextStatus = z.enum(["ACTIVE", "PAUSED"]).parse(status);
    const { organization } = await requireOrganization(organizationSlug);

    await updateQrCode({
      where: { id: qrId, ...liveQrWhere(organization.id) },
      data: { status: nextStatus },
      select: { id: true },
    }).catch(orNotFound);

    refresh();
    return apiResponse.single({ message: nextStatus === "PAUSED" ? "QR code paused" : "QR code resumed", data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// trashed codes stop redirecting but keep their scans and can be restored
export const trashQrAction = async (organizationSlug: string, id: number) => {
  try {
    const qrId = idSchema.parse(id);
    const { organization } = await requireOrganization(organizationSlug);

    await updateQrCode(
      { where: { id: qrId, ...liveQrWhere(organization.id) }, data: { deletedAt: new Date() }, select: { id: true } },
      revalidateTags,
    ).catch(orNotFound);

    refresh();
    return apiResponse.single({ message: "Moved to trash", data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const restoreQrAction = async (organizationSlug: string, id: number) => {
  try {
    const qrId = idSchema.parse(id);
    const { organization } = await requireOrganization(organizationSlug);

    // quota checks read fresh: a cached count could let a code slip past the limit
    if ((await countQrCodes({ where: liveQrWhere(organization.id) }, { cache: false })) >= QR_QUOTA)
      throw new APIError("FORBIDDEN", { message: `You've reached your plan's limit of ${QR_QUOTA} QR codes.` });

    await updateQrCode(
      {
        where: { id: qrId, organizationId: organization.id, deletedAt: { not: null } },
        data: { deletedAt: null },
        select: { id: true },
      },
      revalidateTags,
    ).catch(orNotFound);

    refresh();
    return apiResponse.single({ message: "QR code restored", data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// permanent: the alias becomes free again and its scan history is removed
export const deleteQrAction = async (organizationSlug: string, id: number) => {
  try {
    const qrId = idSchema.parse(id);
    const { organization, role } = await requireOrganization(organizationSlug);
    if (!isAdminRole(role))
      throw new APIError("FORBIDDEN", { message: "Only owners and admins can permanently delete QR codes" });

    await deleteQrCode(
      { where: { id: qrId, organizationId: organization.id, deletedAt: { not: null } }, select: { id: true } },
      [cacheTags.qrScans, cacheTags.qrScanCount],
    ).catch(orNotFound);

    refresh();
    return apiResponse.single({ message: "QR code deleted permanently", data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
