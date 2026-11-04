"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

import { signInSchema, type SignInValues } from "@/features/auth/sign-in/schemas/sign-in-schema";
import { auth } from "@/lib/auth/auth";
import { apiResponse } from "@/utils/response";

export const signInAction = async (values: SignInValues) => {
  try {
    const { email, password } = signInSchema.parse(values);

    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });

    // apiResponse.error rethrows the redirect
    redirect("/");
  } catch (error) {
    // a new code is sent on sign-in (sendOnSignIn)
    if (error instanceof APIError && error.body?.code === "EMAIL_NOT_VERIFIED")
      redirect(`/verify-email?email=${encodeURIComponent(values.email)}`);

    return apiResponse.error({ error });
  }
};
