"use server";

import { refresh } from "next/cache";
import { APIError } from "better-auth/api";

import { requirePermission } from "@/features/organizations/server";
import { qrTagIdSchema } from "@/features/qr-tags/schemas/qr-tags-schema";
import { deleteQrTag } from "@/features/qr-tags/services/qr-tag";
import { cacheTags } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

// the relation is `onDelete: SetNull`, so the tag's codes (trashed ones too) become untagged
const revalidateTags = [cacheTags.qrCodes, cacheTags.qrCodeCount];

export const deleteQrTagAction = async (organizationSlug: string, id: string) => {
  try {
    const tagId = qrTagIdSchema.parse(id);
    const { organization } = await requirePermission(organizationSlug, { tag: ["delete"] }, "You can't delete tags");

    const tag = await deleteQrTag(
      { where: { id: tagId, organizationId: organization.id }, select: { name: true } },
      revalidateTags,
    ).catch((error: unknown) => {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025")
        throw new APIError("NOT_FOUND", { message: "Tag not found" });
      throw error;
    });

    refresh();
    return apiResponse.single({ message: `Tag ${tag.name} deleted`, data: null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
