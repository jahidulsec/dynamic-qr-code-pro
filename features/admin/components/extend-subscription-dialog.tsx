"use client";

import { useState, useTransition, type ReactElement, type ReactNode } from "react";
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
import { extendSubscriptionAction } from "@/features/admin/actions/manage-subscription";
import { extendFormSchema, type ExtendFormValues } from "@/features/admin/schemas/manage-subscription";
import { endOfLocalDay } from "@/features/admin/schemas/review-organization";

type ExtendSubscriptionDialogProps = {
  organization: { id: string; name: string };
  planName: string;
  currentPeriodEnd: Date;
  trigger: ReactElement;
  children: ReactNode;
};

const MODE_OPTIONS = [
  { value: "month", label: "+1 month" },
  { value: "year", label: "+1 year" },
  { value: "until", label: "Until a date" },
];

const DEFAULTS: ExtendFormValues = { mode: "month", until: "" };

// in the admin's time zone
const dateLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** +1 month, +1 year or until a date, counted from whichever is later: today or the current end. */
export function ExtendSubscriptionDialog({
  organization,
  planName,
  currentPeriodEnd,
  trigger,
  children,
}: ExtendSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const { control, handleSubmit, reset } = useForm<ExtendFormValues>({
    resolver: zodResolver(extendFormSchema),
    defaultValues: DEFAULTS,
  });
  const mode = useWatch({ control, name: "mode" });

  const onOpenChange = (next: boolean) => {
    if (isSaving) return;
    setOpen(next);
    if (next) reset(DEFAULTS);
  };

  const onSubmit = handleSubmit((values) =>
    startSaving(async () => {
      const result = await extendSubscriptionAction(
        organization.id,
        values.mode === "until" ? { until: endOfLocalDay(values.until) } : { by: values.mode },
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
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Extend {organization.name}&apos;s {planName} plan</DialogTitle>
            <DialogDescription>
              <PeriodNote planName={planName} currentPeriodEnd={currentPeriodEnd} /> No email is sent.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="extend-mode">Extend by</FieldLabel>
                  <Select
                    id="extend-mode"
                    data={MODE_OPTIONS}
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                    clearable={false}
                  />
                </Field>
              )}
            />
            {mode === "until" && (
              <Controller
                name="until"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="extend-until">New end date</FieldLabel>
                    <Input {...field} id="extend-until" type="date" autoFocus aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <FieldDescription>The plan runs until the end of that day.</FieldDescription>
                    )}
                  </Field>
                )}
              />
            )}
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={isSaving} />}>Cancel</DialogClose>
            <FormButton type="submit" isPending={isSaving}>
              Extend
            </FormButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// inside the dialog's content, so it only renders in the browser once the dialog opens
function PeriodNote({ planName, currentPeriodEnd }: { planName: string; currentPeriodEnd: Date }) {
  const end = new Date(currentPeriodEnd);
  return end.getTime() <= Date.now()
    ? `It ended on ${dateLabel(end)}. Extending counts from today and restores ${planName} straight away.`
    : `It ends on ${dateLabel(end)}. Extending counts from that date.`;
}
