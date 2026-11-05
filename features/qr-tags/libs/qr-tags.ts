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

// matches `OPTIONS_LIMIT` in the server combobox; a client module's constant can't be imported here
const QR_TAG_OPTIONS_LIMIT = 20;

/**
 * Tag options for `QrTagCombobox`: the first page (or a search's matches) plus
 * any `values` asked for, so a selected tag always resolves. Tags are matched
 * by name everywhere (the QR form and the list filter), so the name is the value.
 */
export const getQrTagOptions = async (
  organizationSlug: string,
  { search, values }: { search?: string; values?: string[] } = {},
) => {
  try {
    const { organization } = await requireOrganization(organizationSlug);
    const organizationId = organization.id;
    const select = { name: true } as const;
    // names are saved in capitals
    const query = search?.trim().toUpperCase();

    const [page, picked] = await Promise.all([
      findQrTags({
        where: { organizationId, ...(query && { name: { contains: query } }) },
        select,
        orderBy: { name: "asc" },
        take: QR_TAG_OPTIONS_LIMIT,
      }),
      values?.length
        ? findQrTags({ where: { organizationId, name: { in: values } }, select })
        : Promise.resolve([]),
    ]);

    const names = [...new Set([...page, ...picked].map((tag) => tag.name))];
    const data = names.map((name) => ({ value: name, label: name }));

    return apiResponse.multi({ data, count: data.length });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
