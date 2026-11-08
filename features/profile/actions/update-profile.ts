"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";

import { updateProfileSchema, type UpdateProfileValues } from "@/features/profile/schemas/profile-schema";
import { requireSession } from "@/features/profile/services/require-session";
import { auth } from "@/lib/auth/auth";
import { apiResponse } from "@/utils/response";

export const updateProfileAction = async (values: UpdateProfileValues) => {
  try {
    const { name } = updateProfileSchema.parse(values);
    await requireSession();

    await auth.api.updateUser({ body: { name }, headers: await headers() });

    // the sidebar reads the name from the layout's session
    refresh();
    return apiResponse.single({ message: "Profile updated", data: { name } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
