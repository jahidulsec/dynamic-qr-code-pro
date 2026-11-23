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

    // the creator becomes the owner; the organization starts PENDING until an admin reviews it
    const organization = await auth.api.createOrganization({
      body: { name, slug },
      headers: await headers(),
    });

    // it can't be opened yet, so go back to the list, which confirms the request
    // apiResponse.error rethrows the redirect
    redirect(`/organizations?requested=${encodeURIComponent(organization?.slug ?? slug)}`);
  } catch (error) {
    return apiResponse.error({ error });
  }
};
