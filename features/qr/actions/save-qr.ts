"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";

import prisma from "@/config/db";
import { QR_QUOTA } from "@/features/qr/constants";
import { qrFormSchema, type QrFormInput, type QrFormValues } from "@/features/qr/schemas/qr-schema";
import { countQrCodes } from "@/features/qr/services/get-qrs";
import { requireOrganization } from "@/features/qr/services/require-organization";
import { apiResponse } from "@/utils/response";

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === "P2002";

const tagConnect = (organizationId: string, tag: string) => ({
  connectOrCreate: {
    where: { organizationId_name: { organizationId, name: tag } },
    create: { organizationId, name: tag },
  },
});

const sharedData = (values: QrFormValues) => ({
  name: values.name,
  destination: values.destination,
  style: values.style,
  // a date picked for expiry means "expires at the end of that day"
  expiresAt: values.expiresAt ? new Date(`${values.expiresAt}T23:59:59`) : null,
});

export const createQrAction = async (organizationSlug: string, input: QrFormInput) => {
  try {
    const values = qrFormSchema.parse(input);
    const { session, organization } = await requireOrganization(organizationSlug);

    if ((await countQrCodes(organization.id)) >= QR_QUOTA)
      throw new APIError("FORBIDDEN", {
        message: `You've reached your plan's limit of ${QR_QUOTA} QR codes. Empty the trash or upgrade to add more.`,
      });

    const qr = await prisma.qrCode
      .create({
        data: {
          ...sharedData(values),
          slug: values.slug,
          organization: { connect: { id: organization.id } },
          createdBy: { connect: { id: session.user.id } },
          ...(values.tag ? { tag: tagConnect(organization.id, values.tag) } : {}),
        },
        select: { id: true, slug: true },
      })
      .catch((error) => {
        if (isUniqueViolation(error))
          throw new APIError("CONFLICT", { message: "This short alias is already taken. Try another one." });
        throw error;
      });

    refresh();
    return apiResponse.single({ message: "QR code created", data: qr });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// the alias is printed into the code, so it can't change; only what it points to can
export const updateQrAction = async (organizationSlug: string, id: number, input: QrFormInput) => {
  try {
    const values = qrFormSchema.parse(input);
    const { organization } = await requireOrganization(organizationSlug);

    const { count } = await prisma.qrCode.updateMany({
      where: { id, organizationId: organization.id, deletedAt: null },
      data: sharedData(values),
    });
    if (!count) throw new APIError("NOT_FOUND", { message: "QR code not found" });

    // updateMany can't touch relations, so the tag is set separately (already scoped above)
    await prisma.qrCode.update({
      where: { id },
      data: { tag: values.tag ? tagConnect(organization.id, values.tag) : { disconnect: true } },
    });

    refresh();
    return apiResponse.single({ message: "QR code updated", data: { id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
