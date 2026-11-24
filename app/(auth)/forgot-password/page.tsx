import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/features/auth";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false },
};

// signed-in users go straight to their workspaces
async function ForgotPasswordGate() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/organizations");

  return <ForgotPasswordForm />;
}

export default function ForgotPasswordPage() {
  return (
    // the form is the static shell; the session check streams in behind it
    <Suspense fallback={<ForgotPasswordForm />}>
      <ForgotPasswordGate />
    </Suspense>
  );
}
