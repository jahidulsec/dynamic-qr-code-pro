"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { IconShieldCheck } from "@tabler/icons-react";

import { FormButton } from "@/components/shared/button/button";
import { PasswordInput } from "@/components/shared/input/password";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { changePasswordAction } from "@/features/profile/actions/change-password";
import { PanelBody, PanelFooter } from "@/features/profile/components/profile-panel";
import { changePasswordSchema, type ChangePasswordValues } from "@/features/profile/schemas/profile-schema";

const DEFAULT_VALUES: ChangePasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  revokeOtherSessions: true,
};

type PasswordFieldName = "currentPassword" | "newPassword" | "confirmPassword";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const { control, handleSubmit, reset } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await changePasswordAction(values);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      reset(DEFAULT_VALUES);
    }),
  );

  const passwordField = (name: PasswordFieldName, label: string, autoComplete: string, hint?: string) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`password-${name}`}>{label}</FieldLabel>
          <PasswordInput
            {...field}
            id={`password-${name}`}
            autoComplete={autoComplete}
            disabled={isPending}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : (
            hint && <FieldDescription>{hint}</FieldDescription>
          )}
        </Field>
      )}
    />
  );

  return (
    <form noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <PanelBody className="flex flex-col gap-6">
        <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconShieldCheck className="size-5" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Keep your account secure</p>
            <p className="text-muted-foreground">Use a long password you don&apos;t use anywhere else.</p>
          </div>
        </div>

        <FieldGroup>
          {passwordField("currentPassword", "Current password", "current-password")}
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
            {passwordField("newPassword", "New password", "new-password", "At least 8 characters.")}
            {passwordField("confirmPassword", "Confirm new password", "new-password")}
          </div>

          <Controller
            name="revokeOtherSessions"
            control={control}
            render={({ field }) => (
              <Field orientation="horizontal" className="rounded-lg border p-3">
                <Checkbox
                  id="password-revoke-sessions"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
                <FieldContent>
                  <FieldLabel htmlFor="password-revoke-sessions">Sign out of all other devices</FieldLabel>
                  <FieldDescription>Anyone using your old password elsewhere is signed out.</FieldDescription>
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>
      </PanelBody>

      <PanelFooter>
        <span>You&apos;ll stay signed in on this device.</span>
        <FormButton type="submit" isPending={isPending}>
          Update password
        </FormButton>
      </PanelFooter>
    </form>
  );
}
