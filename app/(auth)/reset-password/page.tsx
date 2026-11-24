import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/features/auth";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false },
  // keep the token in the URL out of Referer headers sent to other sites
  referrer: "no-referrer",
};

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  // the session and the URL token are runtime data, so they stream in behind the static shell
  return (
    <Suspense fallback={null}>
      <ResetPasswordGate searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPasswordGate({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/organizations");

  // the emailed link passes through Better Auth, which adds `token` or `error`
  const { token, error } = await searchParams;

  return (
    <ResetPasswordForm
      token={typeof token === "string" && token ? token : undefined}
      error={typeof error === "string" ? error : undefined}
    />
  );
}
