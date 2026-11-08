"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormButton } from "@/components/shared/button/button";
import { Select } from "@/components/shared/select/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ORGANIZATION_ROLES, ROLE_DETAILS } from "@/features/organizations/libs/roles";
import { PENDING_ACTION_MESSAGE } from "@/features/organizations/libs/settings-types";

// TODO: move to schemas/invite-member-schema.ts once the action exists
const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  role: z.enum(ORGANIZATION_ROLES),
});

type InviteMemberValues = z.infer<typeof inviteMemberSchema>;

type InviteMemberDialogProps = {
  organizationName: string;
  /** only owners can invite another owner */
  viewerIsOwner: boolean;
  trigger: ReactElement;
  children: ReactNode;
};

export function InviteMemberDialog({ organizationName, viewerIsOwner, trigger, children }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const roleOptions = ORGANIZATION_ROLES.map((role) => ({
    value: role,
    label: ROLE_DETAILS[role].label,
    disabled: role === "owner" && !viewerIsOwner,
  }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "member" },
  });

  const role = useWatch({ control, name: "role" });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) reset({ email: "", role: "member" });
  };

  const onSubmit = handleSubmit(async () => {
    // TODO: inviteMemberAction
    toast.info(PENDING_ACTION_MESSAGE);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Invite to {organizationName}</DialogTitle>
            <DialogDescription>We&apos;ll email them a link to join. Invitations expire after 48 hours.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
                  <Input
                    {...field}
                    id="invite-email"
                    type="email"
                    autoComplete="off"
                    autoFocus
                    placeholder="teammate@company.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                  <Select
                    id="invite-role"
                    data={roleOptions}
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                    clearable={false}
                  />
                  <FieldDescription>{ROLE_DETAILS[role].description}</FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <FormButton type="submit" isPending={isSubmitting}>
              Send invitation
            </FormButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
