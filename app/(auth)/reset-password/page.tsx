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

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
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
