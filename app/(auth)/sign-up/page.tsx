import type { Metadata } from "next";

import { SignUpForm } from "@/features/auth";
import { CookieConsentGate } from "@/features/site-pages";

export const metadata: Metadata = {
  title: "Sign up",
  alternates: { canonical: "/sign-up" },
};

export default function SignUpPage() {
  // creating an account signs the user in, which needs a recorded cookie choice
  return (
    <CookieConsentGate>
      <SignUpForm />
    </CookieConsentGate>
  );
}
