"use server";

import { requireAdmin } from "@/features/admin/services/admin-session";
import { countOrganizations } from "@/features/admin/services/organization";
import { apiResponse } from "@/utils/response";

/** Pending requests for the sidebar badge; read fresh so it never lags behind an approval. */
export const getPendingOrganizationCount = async () => {
  try {
    await requireAdmin();
    const data = await countOrganizations({ where: { status: "PENDING" } }, { cache: false });
    return apiResponse.single({ data });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
