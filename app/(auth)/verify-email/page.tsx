import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { VerifyEmailNotice } from "@/features/auth";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false },
};

export default function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  // the session and the URL params are runtime data, so they stream in behind the static shell
  return (
    <Suspense fallback={null}>
      <VerifyEmailGate searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyEmailGate({ searchParams }: Pick<PageProps<"/verify-email">, "searchParams">) {
  const { email, error } = await searchParams;

  // a valid link signs the user in (autoSignInAfterVerification) and lands here
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.emailVerified) redirect("/organizations");

  if (typeof email !== "string" || !email) redirect("/sign-up");

  return <VerifyEmailNotice email={email} error={typeof error === "string" ? error : undefined} />;
}
