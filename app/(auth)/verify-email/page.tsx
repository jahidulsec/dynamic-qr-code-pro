import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { VerifyEmailNotice } from "@/features/auth";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false },
};

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const { email, error } = await searchParams;

  // a valid link signs the user in (autoSignInAfterVerification) and lands here
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.emailVerified) redirect("/organizations");

  if (typeof email !== "string" || !email) redirect("/sign-up");

  return <VerifyEmailNotice email={email} error={typeof error === "string" ? error : undefined} />;
}
