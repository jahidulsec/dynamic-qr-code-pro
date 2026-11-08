"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";

import { QR_QUOTA } from "@/features/qr/constants";
import { liveQrWhere } from "@/features/qr/libs/qr-query";
import { qrFormSchema, type QrFormInput, type QrFormValues } from "@/features/qr/schemas/qr-schema";
import { countQrCodes, createQrCode, getQrCode, updateQrCode } from "@/features/qr/services/qr";
import { requireOrganization } from "@/features/qr/services/require-organization";
import { cacheTags } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const prismaCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error ? error.code : undefined;

// tags are created on the fly through connectOrCreate
const revalidateTags = [cacheTags.qrTags];

const tagWhere = (organizationId: string, name: string) => ({ organizationId_name: { organizationId, name } });

const tagConnect = (organizationId: string, tags: string[]) =>
  tags.map((name) => ({ where: tagWhere(organizationId, name), create: { organizationId, name } }));

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

    // quota checks read fresh: a cached count could let a code slip past the limit
    if ((await countQrCodes({ where: liveQrWhere(organization.id) }, { cache: false })) >= QR_QUOTA)
      throw new APIError("FORBIDDEN", {
        message: `You've reached your plan's limit of ${QR_QUOTA} QR codes. Empty the trash or upgrade to add more.`,
      });

    const qr = await createQrCode(
      {
        data: {
          ...sharedData(values),
          slug: values.slug,
          organization: { connect: { id: organization.id } },
          createdBy: { connect: { id: session.user.id } },
          tags: { connectOrCreate: tagConnect(organization.id, values.tags) },
        },
        select: { id: true, slug: true },
      },
      revalidateTags,
    ).catch((error) => {
      if (prismaCode(error) === "P2002")
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

    // read fresh: the current tags decide which ones to unlink
    const current = await getQrCode(
      { where: { id, ...liveQrWhere(organization.id) }, select: { tags: { select: { name: true } } } },
      { cache: false },
    );
    if (!current) throw new APIError("NOT_FOUND", { message: "QR code not found" });
    const removed = current.tags.filter((tag) => !values.tags.includes(tag.name));

    // the where is scoped to the organization; P2025 means the code went away in between
    await updateQrCode(
      {
        where: { id, ...liveQrWhere(organization.id) },
        data: {
          ...sharedData(values),
          // the two lists never overlap, so the order Prisma applies them in doesn't matter
          tags: {
            connectOrCreate: tagConnect(organization.id, values.tags),
            disconnect: removed.map((tag) => tagWhere(organization.id, tag.name)),
          },
        },
        select: { id: true },
      },
      revalidateTags,
    ).catch((error) => {
      if (prismaCode(error) === "P2025") throw new APIError("NOT_FOUND", { message: "QR code not found" });
      throw error;
    });

    refresh();
    return apiResponse.single({ message: "QR code updated", data: { id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
