"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";

import { requirePermission } from "@/features/organizations/server";
import { qrTagFormSchema, qrTagIdSchema, type QrTagFormInput } from "@/features/qr-tags/schemas/qr-tags-schema";
import { createQrTag, updateQrTag } from "@/features/qr-tags/services/qr-tag";
import { cacheTags } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

const prismaCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error ? error.code : undefined;

const conflict = (name: string) => new APIError("CONFLICT", { message: `A tag named ${name} already exists` });

// QR lists and their tag-filtered counts show the tag's name
const renameRevalidateTags = [cacheTags.qrCodes, cacheTags.qrCodeCount];

// the same permission lets a member type a new tag into the QR form
export const createQrTagAction = async (organizationSlug: string, input: QrTagFormInput) => {
  try {
    const { name } = qrTagFormSchema.parse(input);
    const { organization } = await requirePermission(organizationSlug, { tag: ["create"] }, "You can't create tags");

    const tag = await createQrTag({
      data: { name, organization: { connect: { id: organization.id } } },
      select: { id: true, name: true },
    }).catch((error) => {
      if (prismaCode(error) === "P2002") throw conflict(name);
      throw error;
    });

    refresh();
    return apiResponse.single({ message: `Tag ${tag.name} created`, data: tag });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// renaming relabels every code that uses the tag
export const renameQrTagAction = async (organizationSlug: string, id: string, input: QrTagFormInput) => {
  try {
    const tagId = qrTagIdSchema.parse(id);
    const { name } = qrTagFormSchema.parse(input);
    const { organization } = await requirePermission(organizationSlug, { tag: ["update"] }, "You can't rename tags");

    // the where is scoped to the organization; P2025 means no tag matched
    const tag = await updateQrTag(
      { where: { id: tagId, organizationId: organization.id }, data: { name }, select: { id: true, name: true } },
      renameRevalidateTags,
    ).catch((error) => {
      if (prismaCode(error) === "P2002") throw conflict(name);
      if (prismaCode(error) === "P2025") throw new APIError("NOT_FOUND", { message: "Tag not found" });
      throw error;
    });

    refresh();
    return apiResponse.single({ message: `Tag renamed to ${tag.name}`, data: tag });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
