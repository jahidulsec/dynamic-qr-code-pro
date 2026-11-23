"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";

import { QR_QUOTA } from "@/features/qr/constants";
import { liveQrWhere } from "@/features/qr/libs/qr-query";
import {
  qrFormSchema,
  qrIdSchema,
  qrNewIdSchema,
  type QrFormInput,
  type QrFormValues,
} from "@/features/qr/schemas/qr-schema";
import { countQrCodes, createQrCode, getQrCode, updateQrCode } from "@/features/qr/services/qr";
import { requirePermission, type Access } from "@/features/organizations/server";
import { missingQrTagNames } from "@/features/qr-tags/server";
import { cacheTags } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const prismaCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error ? error.code : undefined;

// tags are created on the fly through connectOrCreate
const revalidateTags = [cacheTags.qrTags];

const tagWhere = (organizationId: string, name: string) => ({ organizationId_name: { organizationId, name } });

const tagConnect = (organizationId: string, tags: string[]) =>
  tags.map((name) => ({ where: tagWhere(organizationId, name), create: { organizationId, name } }));

// saving a code with a tag that doesn't exist yet creates it, which needs its own permission
async function assertCanUseTags(access: Access, tags: string[]) {
  if (access.can({ tag: ["create"] })) return;
  const missing = await missingQrTagNames(access.organization.id, tags);
  if (missing.length)
    throw new APIError("FORBIDDEN", {
      message: `You can't create new tags (${missing.join(", ")}). Pick existing ones instead.`,
    });
}

const sharedData = (values: QrFormValues) => ({
  name: values.name,
  destination: values.destination,
  style: values.style,
  // a date picked for expiry means "expires at the end of that day"
  expiresAt: values.expiresAt ? new Date(`${values.expiresAt}T23:59:59`) : null,
});

// the dialog generates the id so its preview encodes the final link; the format is checked here
// and the primary key rejects a duplicate
export const createQrAction = async (organizationSlug: string, id: string, input: QrFormInput) => {
  try {
    const qrId = qrNewIdSchema.parse(id);
    const values = qrFormSchema.parse(input);
    const access = await requirePermission(organizationSlug, { qr: ["create"] }, "You can't create QR codes");
    const { session, organization } = access;
    await assertCanUseTags(access, values.tags);

    // quota checks read fresh: a cached count could let a code slip past the limit
    if ((await countQrCodes({ where: liveQrWhere(organization.id) }, { cache: false })) >= QR_QUOTA)
      throw new APIError("FORBIDDEN", {
        message: `You've reached your plan's limit of ${QR_QUOTA} QR codes. Empty the trash or upgrade to add more.`,
      });

    const qr = await createQrCode(
      {
        data: {
          id: qrId,
          ...sharedData(values),
          organization: { connect: { id: organization.id } },
          createdBy: { connect: { id: session.user.id } },
          tags: { connectOrCreate: tagConnect(organization.id, values.tags) },
        },
        select: { id: true },
      },
      revalidateTags,
    ).catch((error) => {
      if (prismaCode(error) === "P2002")
        throw new APIError("CONFLICT", { message: "This link is already in use. Reopen the dialog to get a new one." });
      throw error;
    });

    refresh();
    return apiResponse.single({ message: "QR code created", data: qr });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// the id is printed into the code, so it can't change; only what it points to can
export const updateQrAction = async (organizationSlug: string, id: string, input: QrFormInput) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const values = qrFormSchema.parse(input);
    const access = await requirePermission(organizationSlug, { qr: ["update"] }, "You can't edit QR codes");
    const { organization } = access;
    await assertCanUseTags(access, values.tags);

    // read fresh: the current tags decide which ones to unlink
    const current = await getQrCode(
      { where: { id: qrId, ...liveQrWhere(organization.id) }, select: { tags: { select: { name: true } } } },
      { cache: false },
    );
    if (!current) throw new APIError("NOT_FOUND", { message: "QR code not found" });
    const removed = current.tags.filter((tag) => !values.tags.includes(tag.name));

    // the where is scoped to the organization; P2025 means the code went away in between
    await updateQrCode(
      {
        where: { id: qrId, ...liveQrWhere(organization.id) },
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
    return apiResponse.single({ message: "QR code updated", data: { id: qrId } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
