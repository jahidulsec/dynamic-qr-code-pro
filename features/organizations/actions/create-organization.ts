"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  createOrganizationSchema,
  type CreateOrganizationValues,
} from "@/features/organizations/schemas/create-organization-schema";
import { auth } from "@/lib/auth/auth";
import { apiResponse } from "@/utils/response";

export const createOrganizationAction = async (values: CreateOrganizationValues) => {
  try {
    const { name, slug } = createOrganizationSchema.parse(values);

    // the creator becomes the owner and the new organization becomes the active one
    const organization = await auth.api.createOrganization({
      body: { name, slug },
      headers: await headers(),
    });

    // apiResponse.error rethrows the redirect
    redirect(`/${organization?.slug ?? slug}`);
  } catch (error) {
    return apiResponse.error({ error });
  }
};
