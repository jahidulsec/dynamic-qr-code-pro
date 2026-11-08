"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormButton } from "@/components/shared/button/button";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/forgot-password/schemas/forgot-password-schema";
import { requestPasswordReset } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

// the emailed link lands here with `token`, or with `error` when it's invalid or expired
const RESET_PASSWORD_PATH = "/reset-password";

// called from the browser, not a server action, so Better Auth's rate limit on this endpoint applies
async function sendResetLink(email: string) {
  const { error } = await requestPasswordReset({
    email,
    redirectTo: RESET_PASSWORD_PATH,
  });
  if (error)
    toast.error(
      error.message ?? "Unable to send the reset link. Please try again.",
    );
  return !error;
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    if (await sendResetLink(email)) setSentTo(email);
  });

  const onResend = async () => {
    if (!sentTo) return;
    setIsResending(true);
    if (await sendResetLink(sentTo))
      toast.success(`A new link is on its way to ${sentTo}.`);
    setIsResending(false);
  };

  if (sentTo)
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          {/* same wording whether or not the account exists, so this page can't be used to probe emails */}
          <p className="text-sm text-balance text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{sentTo}</span>, we
            sent a link to reset your password. It expires in 1 hour.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={onResend} disabled={isResending}>
            {isResending ? "Sending…" : "Resend reset link"}
          </Button>
          <FieldDescription className="text-center">
            Wrong email?{" "}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => setSentTo(null)}
            >
              Try again
            </button>{" "}
            or <Link href="/sign-in">back to sign in</Link>
          </FieldDescription>
        </div>
      </div>
    );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form noValidate onSubmit={onSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email and we&apos;ll send you a link to reset it
            </p>
          </div>

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <FormButton type="submit" isPending={isSubmitting}>
              Send reset link
            </FormButton>
            <FieldDescription className="text-center">
              Remembered it? <Link href="/sign-in">Back to sign in</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
