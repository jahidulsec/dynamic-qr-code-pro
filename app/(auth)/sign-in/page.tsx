import type { Metadata } from "next";

import { SignInForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign in",
  alternates: { canonical: "/sign-in" },
};

export default function SignInPage() {
  return <SignInForm />;
}
