"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signUpSchema, type SignUpValues } from "@/features/auth/sign-up/schemas/sign-up-schema";
import { auth } from "@/lib/auth/auth";
import { apiResponse } from "@/utils/response";

export const signUpAction = async (values: SignUpValues) => {
  try {
    const { name, email, password } = signUpSchema.parse(values);

    await auth.api.signUpEmail({ body: { name, email, password }, headers: await headers() });

    // apiResponse.error rethrows the redirect
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  } catch (error) {
    return apiResponse.error({ error });
  }
};
