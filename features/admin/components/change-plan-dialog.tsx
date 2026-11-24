"use client";

import { useState, useTransition, type ReactElement, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { setSubscriptionAction } from "@/features/admin/actions/manage-subscription";
import type { SelectablePlan } from "@/features/admin/components/approve-organization-dialog";
import {
  changePlanFormSchema,
  startOfLocalDay,
  type ChangePlanFormValues,
} from "@/features/admin/schemas/manage-subscription";
import { endOfLocalDay } from "@/features/admin/schemas/review-organization";
import type { BillingInterval, SubscriptionStatus } from "@/generated/prisma/client";
import { toDateInput } from "@/utils/format";

export type CurrentSubscription = {
  planId: string;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  notes: string | null;
};

type ChangePlanDialogProps = {
  organization: { id: string; name: string };
  subscription: CurrentSubscription | null;
  /** plans that aren't archived */
  plans: SelectablePlan[];
  trigger: ReactElement;
  children: ReactNode;
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "TRIALING", label: "Trial" },
];

const INTERVAL_OPTIONS = [
  { value: "NONE", label: "None (free, lifetime or custom deal)" },
  { value: "MONTH", label: "Monthly" },
  { value: "YEAR", label: "Yearly" },
];

// worked out when the dialog opens, in the browser's time zone
const defaultsFor = (subscription: CurrentSubscription | null, plans: SelectablePlan[]): ChangePlanFormValues => {
  const current = subscription && plans.some((plan) => plan.id === subscription.planId) ? subscription.planId : null;
  const fallback = plans.find((plan) => plan.isDefault)?.id ?? plans[0]?.id ?? "";
  // a canceled subscription is set up again from today
  const live = subscription && subscription.status !== "CANCELED" ? subscription : null;

  return {
    planId: current ?? fallback,
    status: live?.status === "TRIALING" ? "TRIALING" : "ACTIVE",
    interval: subscription?.interval ?? "NONE",
    currentPeriodStart: toDateInput(live ? new Date(live.currentPeriodStart) : new Date()),
    currentPeriodEnd: live?.currentPeriodEnd ? toDateInput(new Date(live.currentPeriodEnd)) : "",
    notes: subscription?.notes ?? "",
    emailOwners: true,
  };
};

/** setSubscriptionAction's fields (spec 04, "Change plan"): creates or replaces the subscription. */
export function ChangePlanDialog({ organization, subscription, plans, trigger, children }: ChangePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const { control, handleSubmit, reset } = useForm<ChangePlanFormValues>({
    resolver: zodResolver(changePlanFormSchema),
    defaultValues: { planId: "", status: "ACTIVE", interval: "NONE", currentPeriodStart: "", currentPeriodEnd: "", notes: "", emailOwners: true },
  });

  const onOpenChange = (next: boolean) => {
    if (isSaving) return;
    setOpen(next);
    if (next) reset(defaultsFor(subscription, plans));
  };

  const onSubmit = handleSubmit((values) =>
    startSaving(async () => {
      const result = await setSubscriptionAction(
        organization.id,
        {
          planId: values.planId,
          status: values.status,
          interval: values.interval,
          currentPeriodStart: startOfLocalDay(values.currentPeriodStart),
          currentPeriodEnd: values.currentPeriodEnd ? endOfLocalDay(values.currentPeriodEnd) : null,
          notes: values.notes,
        },
        { emailOwners: values.emailOwners },
      );
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
      <DialogContent className="sm:max-w-lg">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Change plan for {organization.name}</DialogTitle>
            <DialogDescription>The new plan and its limits apply straight away.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="planId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="change-plan-plan">Plan</FieldLabel>
                  <Select
                    id="change-plan-plan"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="change-plan-status">Status</FieldLabel>
                    <Select
                      id="change-plan-status"
                      data={STATUS_OPTIONS}
                      value={field.value}
                      onValueChange={(value) => value && field.onChange(value)}
                      clearable={false}
                    />
                  </Field>
                )}
              />
              <Controller
                name="interval"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="change-plan-interval">Billing interval</FieldLabel>
                    <Select
                      id="change-plan-interval"
                      data={INTERVAL_OPTIONS}
                      value={field.value}
                      onValueChange={(value) => value && field.onChange(value)}
                      clearable={false}
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="currentPeriodStart"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="change-plan-start">Period start</FieldLabel>
                    <Input {...field} id="change-plan-start" type="date" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="currentPeriodEnd"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="change-plan-end">Period end</FieldLabel>
                    <Input {...field} id="change-plan-end" type="date" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <FieldDescription>Empty means no end date.</FieldDescription>
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="notes"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="change-plan-notes">Internal notes</FieldLabel>
                  <Textarea {...field} id="change-plan-notes" rows={3} maxLength={2000} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Only admins see these.</FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              name="emailOwners"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal" className="rounded-lg border p-3">
                  <Checkbox
                    id="change-plan-email"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSaving}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="change-plan-email">Email owners about this change</FieldLabel>
                    <FieldDescription>Sent only when the plan itself changes.</FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={isSaving} />}>Cancel</DialogClose>
            <FormButton type="submit" isPending={isSaving}>
              Save subscription
            </FormButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
