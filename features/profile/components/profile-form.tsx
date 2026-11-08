"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { IconAlertCircle, IconCalendarEvent, IconCircleCheckFilled, IconLock } from "@tabler/icons-react";

import { FormButton } from "@/components/shared/button/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/features/profile/actions/update-profile";
import { PanelBody, PanelFooter } from "@/features/profile/components/profile-panel";
import { initialsOf, type ProfileUser } from "@/features/profile/libs/profile-user";
import { updateProfileSchema, type UpdateProfileValues } from "@/features/profile/schemas/profile-schema";
import { cn } from "@/lib/utils";

const joinedFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

const Chip = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    {...props}
    className={cn(
      "inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground [&_svg]:size-3.5",
      className,
    )}
  />
);

export function ProfileForm({ user }: { user: ProfileUser }) {
  const [isPending, startTransition] = useTransition();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name },
  });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      reset({ name: result.data.name });
    }),
  );

  return (
    <form noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <PanelBody className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-xl border">
          <div aria-hidden className="relative h-20 bg-linear-to-br from-primary/35 via-primary/10 to-transparent">
            <div className="absolute inset-0 bg-[radial-gradient(var(--color-foreground)_1px,transparent_1px)] bg-size-[16px_16px] opacity-[0.08] mask-[linear-gradient(to_bottom,black,transparent)]" />
          </div>
          <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-end sm:gap-4">
            <Avatar className="-mt-9 size-18 shadow-md ring-4 ring-popover after:hidden">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-linear-to-br from-primary to-primary/70 text-xl font-semibold text-primary-foreground">
                {initialsOf(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.emailVerified ? (
                  <Chip className="border-success/30 bg-success/10 text-success">
                    <IconCircleCheckFilled />
                    Verified
                  </Chip>
                ) : (
                  <Chip className="border-destructive/30 bg-destructive/10 text-destructive">
                    <IconAlertCircle />
                    Unverified
                  </Chip>
                )}
                <Chip>
                  <IconCalendarEvent />
                  Joined {joinedFormatter.format(new Date(user.createdAt))}
                </Chip>
              </div>
            </div>
          </div>
        </div>

        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
                <Input
                  {...field}
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>How teammates see you across your organizations.</FieldDescription>
                )}
              </Field>
            )}
          />

          <Field>
            <FieldLabel htmlFor="profile-email">Email address</FieldLabel>
            <div className="relative">
              <Input id="profile-email" type="email" value={user.email} readOnly className="bg-muted/50 pr-9" />
              <IconLock className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
            </div>
            <FieldDescription>Used to sign in. Changing it isn&apos;t supported yet.</FieldDescription>
          </Field>
        </FieldGroup>
      </PanelBody>

      <PanelFooter>
        <span>{isDirty ? "You have unsaved changes." : "Changes apply everywhere you're a member."}</span>
        <div className="flex gap-2 sm:justify-end">
          {isDirty && (
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => reset()}>
              Discard
            </Button>
          )}
          <FormButton type="submit" isPending={isPending} disabled={!isDirty}>
            Save changes
          </FormButton>
        </div>
      </PanelFooter>
    </form>
  );
}
