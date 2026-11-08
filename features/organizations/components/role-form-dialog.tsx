"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { IconAlertTriangle } from "@tabler/icons-react";

import { FormButton } from "@/components/shared/button/button";
import { Select } from "@/components/shared/select/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { createRoleAction, updateRoleAction } from "@/features/organizations/actions/manage-roles";
import { useAccess } from "@/features/organizations/components/access-provider";
import type { RoleInfo } from "@/features/organizations/libs/roles";
import {
  emptyPermissionInput,
  roleFormSchema,
  type RoleFormInput,
  type RoleFormValues,
} from "@/features/organizations/schemas/role-schema";
import { PERMISSION_CATALOGUE, type Permissions } from "@/lib/auth/permissions";

type RoleFormDialogProps = {
  organizationSlug: string;
  trigger: ReactElement;
  children: ReactNode;
  /** set when editing an existing custom role */
  role?: RoleInfo;
};

const toInput = (permissions: Permissions): Record<string, string[]> => ({
  ...emptyPermissionInput(),
  ...Object.fromEntries(Object.entries(permissions).map(([resource, actions]) => [resource, [...(actions ?? [])]])),
});

const defaultsFor = (role?: RoleInfo): RoleFormInput => ({
  label: role?.label ?? "",
  description: role?.description ?? "",
  permissions: toInput(role?.permissions ?? {}),
});

export function RoleFormDialog({ organizationSlug, trigger, children, role }: RoleFormDialogProps) {
  const access = useAccess();
  const [open, setOpen] = useState(false);
  const isEdit = !!role;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<RoleFormInput, unknown, RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: defaultsFor(role),
  });

  const permissions = useWatch({ control, name: "permissions" });
  const sensitive = PERMISSION_CATALOGUE.flatMap((group) =>
    group.actions.filter((a) => a.sensitive && permissions[group.resource]?.includes(a.action)).map((a) => a.label),
  );

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) reset(defaultsFor(role));
  };

  // copies another role's grants, keeping only those the viewer may hand out
  const startFrom = (key: string | null) => {
    const source = access.roles.find((r) => r.key === key);
    if (!source) return;
    const granted = toInput(source.permissions);
    for (const resource of Object.keys(granted))
      granted[resource] = granted[resource].filter((action) => access.can({ [resource]: [action] } as Permissions));
    setValue("permissions", granted, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const result = isEdit
      ? await updateRoleAction(organizationSlug, role.key, values)
      : await createRoleAction(organizationSlug, values);

    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{isEdit ? `Edit ${role.label}` : "New role"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Changes apply straight away to everyone with this role."
                : "Pick exactly what members with this role can do. You can only grant permissions you have."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="label"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="role-label">Name</FieldLabel>
                    <Input
                      {...field}
                      id="role-label"
                      autoComplete="off"
                      autoFocus
                      placeholder="Field team"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              {!isEdit && (
                <Field>
                  <FieldLabel htmlFor="role-start-from">Start from</FieldLabel>
                  <Select
                    id="role-start-from"
                    data={access.roles.map((r) => ({ value: r.key, label: r.label }))}
                    onValueChange={startFrom}
                    placeholder="Copy an existing role"
                    clearable={false}
                  />
                </Field>
              )}
            </div>

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="role-description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="role-description"
                    rows={2}
                    placeholder="What this role is for"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="permissions"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Permissions</FieldLabel>
                  <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
                    {PERMISSION_CATALOGUE.map((group) => (
                      <fieldset key={group.resource} className="flex flex-col gap-2 bg-card p-4">
                        <legend className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {group.label}
                        </legend>
                        {group.actions.map(({ action, label }) => {
                          const id = `perm-${group.resource}-${action}`;
                          const checked = field.value[group.resource]?.includes(action) ?? false;
                          // a grant the viewer lacks can't be added, but one already on the role can be removed
                          const allowed = access.can({ [group.resource]: [action] } as Permissions);
                          return (
                            <label
                              key={action}
                              htmlFor={id}
                              className="flex items-center gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:text-muted-foreground"
                            >
                              <Checkbox
                                id={id}
                                checked={checked}
                                disabled={!allowed && !checked}
                                onCheckedChange={(next) => {
                                  const current = field.value[group.resource] ?? [];
                                  field.onChange({
                                    ...field.value,
                                    [group.resource]: next
                                      ? [...current, action]
                                      : current.filter((value) => value !== action),
                                  });
                                }}
                              />
                              {label}
                            </label>
                          );
                        })}
                      </fieldset>
                    ))}
                  </div>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Greyed-out permissions are ones you don&apos;t have yourself.</FieldDescription>
                  )}
                </Field>
              )}
            />

            {sensitive.length > 0 && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
                <IconAlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  This role controls the organization itself: {sensitive.join(", ").toLowerCase()}. Give it only to
                  people you&apos;d trust as an admin.
                </span>
              </p>
            )}
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <FormButton type="submit" isPending={isSubmitting}>
              {isEdit ? "Save role" : "Create role"}
            </FormButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
