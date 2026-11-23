"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";
import { z } from "zod";

import { QR_QUOTA } from "@/features/qr/constants";
import { liveQrWhere } from "@/features/qr/libs/qr-query";
import { qrIdSchema } from "@/features/qr/schemas/qr-schema";
import { countQrCodes, deleteQrCode, updateQrCode, updateQrCodes } from "@/features/qr/services/qr";
import { requirePermission } from "@/features/organizations/server";
import { cacheTags } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const notFound = () => new APIError("NOT_FOUND", { message: "QR code not found" });

// P2025: the scoped where matched no row (wrong organization, or not in the expected trash state)
const orNotFound = (error: unknown): never => {
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") throw notFound();
  throw error;
};

// tag counts include only codes outside the trash, so trash moves bust them too
const revalidateTags = [cacheTags.qrTags];

export const setQrStatusAction = async (organizationSlug: string, id: string, status: "ACTIVE" | "PAUSED") => {
  try {
    const qrId = qrIdSchema.parse(id);
    const nextStatus = z.enum(["ACTIVE", "PAUSED"]).parse(status);
    const { organization } = await requirePermission(organizationSlug, { qr: ["status"] }, "You can't pause or resume QR codes");

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
export const trashQrAction = async (organizationSlug: string, id: string) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requirePermission(organizationSlug, { qr: ["trash"] }, "You can't move QR codes to the trash");

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

// bulk variant: codes already trashed or outside this organization are skipped, not failed
export const trashQrCodesAction = async (organizationSlug: string, ids: string[]) => {
  try {
    const qrIds = z.array(qrIdSchema).min(1).max(QR_QUOTA).parse(ids);
    const { organization } = await requirePermission(organizationSlug, { qr: ["trash"] }, "You can't move QR codes to the trash");

    const { count } = await updateQrCodes(
      { where: { id: { in: qrIds }, ...liveQrWhere(organization.id) }, data: { deletedAt: new Date() } },
      revalidateTags,
    );
    if (!count) throw notFound();

    refresh();
    return apiResponse.single({
      message: `Moved ${count} QR code${count === 1 ? "" : "s"} to trash`,
      data: { count },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const restoreQrAction = async (organizationSlug: string, id: string) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requirePermission(organizationSlug, { qr: ["restore"] }, "You can't restore QR codes");

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

// permanent: the code and its scan history are removed
export const deleteQrAction = async (organizationSlug: string, id: string) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requirePermission(organizationSlug, { qr: ["delete"] }, "You can't permanently delete QR codes");

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
