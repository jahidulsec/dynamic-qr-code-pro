import type { Metadata } from "next";

import { SignUpForm } from "@/features/auth/sign-up/components/sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
  alternates: { canonical: "/sign-up" },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
