"use server";

import { requireOrganization } from "@/features/qr/server";
import { qrTagListSelect, toQrTagListItem } from "@/features/qr-tags/libs/qr-tags-query";
import { getQrTags as findQrTags } from "@/features/qr-tags/services/qr-tag";
import { cacheTags } from "@/lib/cache/cache-tags";
import { apiResponse } from "@/utils/response";

// every tag with its live QR count; small enough per organization that it isn't paginated
export const getQrTags = async (organizationSlug: string) => {
  try {
    const { organization } = await requireOrganization(organizationSlug);

    const tags = await findQrTags(
      { where: { organizationId: organization.id }, select: qrTagListSelect, orderBy: { name: "asc" } },
      // counts change when codes are trashed or restored
      { tags: cacheTags.qrCodes },
    );
    const data = tags.map(toQrTagListItem);

    return apiResponse.multi({ data, count: data.length });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
