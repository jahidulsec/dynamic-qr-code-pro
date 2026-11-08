"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

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
import { inviteMemberAction } from "@/features/organizations/actions/manage-members";
import { useAccess } from "@/features/organizations/components/access-provider";
import { cannotAssignReason } from "@/features/organizations/libs/roles";
import {
  inviteMemberSchema,
  type InviteMemberValues,
} from "@/features/organizations/schemas/invite-member-schema";

type InviteMemberDialogProps = {
  organizationSlug: string;
  organizationName: string;
  trigger: ReactElement;
  children: ReactNode;
};

export function InviteMemberDialog({
  organizationSlug,
  organizationName,
  trigger,
  children,
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const access = useAccess();
  // roles carrying access the viewer lacks can't be handed out; the server checks the same rule
  const roleOptions = access.roles.map((role) => ({
    value: role.key,
    label: role.label,
    disabled: !!cannotAssignReason(access, role),
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

  const onSubmit = handleSubmit(async (values) => {
    const result = await inviteMemberAction(organizationSlug, values);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    setOpen(false);
    toast.success(result.message);
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
                  <FieldDescription>{access.roles.find((r) => r.key === role)?.description}</FieldDescription>
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
