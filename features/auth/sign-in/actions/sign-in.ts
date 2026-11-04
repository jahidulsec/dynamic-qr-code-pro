"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

import { signInSchema, type SignInValues } from "@/features/auth/sign-in/schemas/sign-in-schema";
import { verifyEmailURL } from "@/features/auth/verify-email/utils/verify-email-url";
import { auth } from "@/lib/auth/auth";
import { apiResponse } from "@/utils/response";

export const signInAction = async (values: SignInValues) => {
  try {
    const { email, password } = signInSchema.parse(values);

    // callbackURL is only used by the verification link sent to unverified users
    await auth.api.signInEmail({
      body: { email, password, callbackURL: verifyEmailURL(email) },
      headers: await headers(),
    });

    // apiResponse.error rethrows the redirect
    redirect("/organizations");
  } catch (error) {
    // a new link is sent on sign-in (sendOnSignIn)
    if (error instanceof APIError && error.body?.code === "EMAIL_NOT_VERIFIED")
      redirect(verifyEmailURL(values.email));

    return apiResponse.error({ error });
  }
};
