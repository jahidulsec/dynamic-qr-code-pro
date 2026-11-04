"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { verifyEmailSchema, type VerifyEmailValues } from "@/features/auth/verify-email/schemas/verify-email-schema";
import { emailOtp } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

type VerifyEmailFormProps = React.ComponentProps<"form"> & { email: string };

export function VerifyEmailForm({ email, className, ...props }: VerifyEmailFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = handleSubmit(async ({ otp }) => {
    setFormError(null);

    // creates the session on success (autoSignInAfterVerification)
    const { error } = await emailOtp.verifyEmail({ email, otp });
    if (error) {
      setFormError(error.message ?? "Unable to verify your email. Please try again.");
      return;
    }

    router.push("/");
    router.refresh();
  });

  const onResend = async () => {
    setFormError(null);
    setResendStatus("sending");

    const { error } = await emailOtp.sendVerificationOtp({ email, type: "email-verification" });
    if (error) {
      setFormError(error.message ?? "Unable to resend the code. Please try again.");
      setResendStatus("idle");
      return;
    }

    setResendStatus("sent");
  };

  return (
    <form noValidate onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="text-sm text-balance text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Controller
          name="otp"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Verification code</FieldLabel>
              <Input
                {...field}
                onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))}
                id={field.name}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                className="text-center tracking-[0.5em]"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>The code expires in 5 minutes.</FieldDescription>
              )}
            </Field>
          )}
        />

        {formError && <FieldError>{formError}</FieldError>}

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying…" : "Verify email"}
          </Button>
          <FieldDescription className="text-center">
            {resendStatus === "sent" ? (
              "A new code is on its way."
            ) : (
              <>
                Didn&apos;t get a code?{" "}
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resendStatus === "sending"}
                  className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
                >
                  {resendStatus === "sending" ? "Sending…" : "Resend"}
                </button>
              </>
            )}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
