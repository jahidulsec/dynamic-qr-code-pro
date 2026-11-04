import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { VerifyEmailForm } from "@/features/auth/verify-email/components/verify-email-form";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false },
};

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const { email } = await searchParams;
  if (typeof email !== "string" || !email) redirect("/sign-up");

  return <VerifyEmailForm email={email} />;
}
