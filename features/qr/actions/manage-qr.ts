"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";
import { z } from "zod";

import prisma from "@/config/db";
import { QR_QUOTA } from "@/features/qr/constants";
import { countQrCodes } from "@/features/qr/services/get-qrs";
import { isAdminRole, requireOrganization } from "@/features/qr/services/require-organization";
import { apiResponse } from "@/utils/response";

const idSchema = z.number().int().positive();

const notFound = () => new APIError("NOT_FOUND", { message: "QR code not found" });

export const setQrStatusAction = async (organizationSlug: string, id: number, status: "ACTIVE" | "PAUSED") => {
  try {
    const qrId = idSchema.parse(id);
    const nextStatus = z.enum(["ACTIVE", "PAUSED"]).parse(status);
    const { organization } = await requireOrganization(organizationSlug);

    const { count } = await prisma.qrCode.updateMany({
      where: { id: qrId, organizationId: organization.id, deletedAt: null },
      data: { status: nextStatus },
    });
    if (!count) throw notFound();

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

    const { count } = await prisma.qrCode.updateMany({
      where: { id: qrId, organizationId: organization.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (!count) throw notFound();

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

    if ((await countQrCodes(organization.id)) >= QR_QUOTA)
      throw new APIError("FORBIDDEN", { message: `You've reached your plan's limit of ${QR_QUOTA} QR codes.` });

    const { count } = await prisma.qrCode.updateMany({
      where: { id: qrId, organizationId: organization.id, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    if (!count) throw notFound();

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

    const { count } = await prisma.qrCode.deleteMany({
      where: { id: qrId, organizationId: organization.id, deletedAt: { not: null } },
    });
    if (!count) throw notFound();

    refresh();
    return apiResponse.single({ message: "QR code deleted permanently", data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
