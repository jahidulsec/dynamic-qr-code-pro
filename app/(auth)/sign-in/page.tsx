import { Suspense } from "react";
import type { Metadata } from "next";

import { SignInForm, SwitchAccountButton } from "@/features/auth";
import { getSession, OrganizationList } from "@/features/organizations/server";

export const metadata: Metadata = {
  title: "Sign in",
  alternates: { canonical: "/sign-in" },
};

// signed-in users pick a workspace instead of seeing the form again
async function SignInGate() {
  const session = await getSession();
  if (!session) return <SignInForm />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">You&apos;re already signed in</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.user.email}</span>. Choose a workspace
          to continue.
        </p>
      </div>
      <OrganizationList />
      <div className="flex justify-center">
        <SwitchAccountButton />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    // the form is the static shell; the session check streams in behind it
    <Suspense fallback={<SignInForm />}>
      <SignInGate />
    </Suspense>
  );
}
