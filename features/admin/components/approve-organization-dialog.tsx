"use client";

import { useState, useTransition, type ReactElement, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { approveOrganizationAction } from "@/features/admin/actions/review-organization";
import {
  approveOrganizationFormSchema,
  endOfLocalDay,
  type ApproveOrganizationFormValues,
} from "@/features/admin/schemas/review-organization";

export type SelectablePlan = { id: string; name: string; isDefault: boolean };

type ApproveOrganizationDialogProps = {
  organization: { id: string; name: string };
  /** plans that aren't archived */
  plans: SelectablePlan[];
  trigger: ReactElement;
  children: ReactNode;
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "TRIALING", label: "Trial" },
];

export function ApproveOrganizationDialog({ organization, plans, trigger, children }: ApproveOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isApproving, startApproving] = useTransition();

  const defaults: ApproveOrganizationFormValues = {
    planId: plans.find((plan) => plan.isDefault)?.id ?? plans[0]?.id ?? "",
    status: "ACTIVE",
    currentPeriodEnd: "",
  };

  const { control, handleSubmit, reset } = useForm<ApproveOrganizationFormValues>({
    resolver: zodResolver(approveOrganizationFormSchema),
    defaultValues: defaults,
  });

  const onOpenChange = (next: boolean) => {
    if (isApproving) return;
    setOpen(next);
    if (next) reset(defaults);
  };

  const onSubmit = handleSubmit((values) =>
    startApproving(async () => {
      const result = await approveOrganizationAction(organization.id, {
        planId: values.planId,
        status: values.status,
        currentPeriodEnd: values.currentPeriodEnd ? endOfLocalDay(values.currentPeriodEnd) : undefined,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setOpen(false);
      toast.success(result.message);
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Approve {organization.name}</DialogTitle>
            <DialogDescription>
              The organization becomes active straight away, and its owners get the activation email.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="planId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="approve-plan">Plan</FieldLabel>
                  <Select
                    id="approve-plan"
                    data={plans.map((plan) => ({
                      value: plan.id,
                      label: plan.isDefault ? `${plan.name} (default)` : plan.name,
                    }))}
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                    clearable={false}
                    placeholder="Choose a plan"
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Archived plans can&apos;t be chosen.</FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="approve-status">Status</FieldLabel>
                  <Select
                    id="approve-status"
                    data={STATUS_OPTIONS}
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                    clearable={false}
                  />
                </Field>
              )}
            />

            <Controller
              name="currentPeriodEnd"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="approve-period-end">Period end (optional)</FieldLabel>
                  <Input {...field} id="approve-period-end" type="date" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Leave empty for no end date. The plan runs until the end of that day.</FieldDescription>
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={isApproving} />}>Cancel</DialogClose>
            <FormButton type="submit" isPending={isApproving}>
              Approve and send activation email
            </FormButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
