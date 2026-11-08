"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormButton } from "@/components/shared/button/button";
import { PasswordInput } from "@/components/shared/input/password";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/reset-password/schemas/reset-password-schema";
import { resetPassword } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

type ResetPasswordFormProps = React.ComponentProps<"div"> & {
  /** from the emailed link; missing when Better Auth rejected the link */
  token?: string;
  /** set by Better Auth (INVALID_TOKEN) when the link is invalid or expired */
  error?: string;
};

export function ResetPasswordForm({
  token,
  error,
  className,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter();
  // the link can also turn out to be used or expired only on submit
  const [linkInvalid, setLinkInvalid] = useState(!token || Boolean(error));

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    if (!token) return;

    const { error } = await resetPassword({ token, newPassword });
    if (error) {
      if (error.code === "INVALID_TOKEN") setLinkInvalid(true);
      else
        toast.error(
          error.message ?? "Unable to reset your password. Please try again.",
        );
      return;
    }

    // every session was revoked on reset, so the user signs in again with the new password
    toast.success("Password reset. Sign in with your new password.");
    router.replace("/sign-in");
  });

  if (linkInvalid)
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Link not valid
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            This reset link is invalid, expired or has already been used.
            Request a new one below.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/forgot-password" />}
          >
            Request a new link
          </Button>
          <FieldDescription className="text-center">
            <Link href="/sign-in">Back to sign in</Link>
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
              Choose a new password
            </h1>
            <p className="text-sm text-balance text-muted-foreground">
              You&apos;ll be signed out on every device and can sign in with the
              new password
            </p>
          </div>

          <Controller
            name="newPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>
                    Must be at least 8 characters.
                  </FieldDescription>
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Confirm new password
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  autoComplete="new-password"
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
              Reset password
            </FormButton>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
