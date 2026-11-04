"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { verifyEmailURL } from "@/features/auth/verify-email/utils/verify-email-url";
import { sendVerificationEmail } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

// error codes Better Auth appends to the callback URL when a link can't be used
const linkErrors: Record<string, string> = {
  TOKEN_EXPIRED: "This verification link has expired.",
  INVALID_TOKEN: "This verification link is invalid.",
};

type VerifyEmailNoticeProps = React.ComponentProps<"div"> & { email: string; error?: string };

export function VerifyEmailNotice({ email, error, className, ...props }: VerifyEmailNoticeProps) {
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  const onResend = async () => {
    setResendStatus("sending");

    const { error } = await sendVerificationEmail({ email, callbackURL: verifyEmailURL(email) });
    if (error) {
      toast.error(error.message ?? "Unable to resend the link. Please try again.");
      setResendStatus("idle");
      return;
    }

    setResendStatus("sent");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {error ? "Link not valid" : "Check your email"}
        </h1>
        <p className="text-sm text-balance text-muted-foreground">
          {error ? (
            `${linkErrors[error] ?? "We couldn't verify your email."} Request a new link below.`
          ) : (
            <>
              We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Open it to
              activate your account.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onResend} disabled={resendStatus !== "idle"}>
          {resendStatus === "sending" ? "Sending…" : resendStatus === "sent" ? "Link sent" : "Resend verification link"}
        </Button>
        <FieldDescription className="text-center">
          {resendStatus === "sent" ? (
            `A new link is on its way to ${email}.`
          ) : (
            <>
              Wrong email? <Link href="/sign-up">Sign up again</Link>
            </>
          )}
        </FieldDescription>
      </div>
    </div>
  );
}
