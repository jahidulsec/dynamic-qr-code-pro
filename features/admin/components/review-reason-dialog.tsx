"use client";

import { useState, useTransition, type ReactElement, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormButton } from "@/components/shared/button/button";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { rejectOrganizationAction, suspendOrganizationAction } from "@/features/admin/actions/review-organization";
import {
  REVIEW_REASON_MAX,
  reviewReasonSchema,
  type ReviewReasonValues,
} from "@/features/admin/schemas/review-organization";

const MODES = {
  reject: {
    title: (name: string) => `Reject ${name}`,
    description: "The request is declined. Its owners can withdraw it, and you can still approve it later.",
    confirm: "Reject request",
    action: rejectOrganizationAction,
  },
  suspend: {
    title: (name: string) => `Suspend ${name}`,
    description: "Members are locked out until you reactivate the organization.",
    confirm: "Suspend organization",
    action: suspendOrganizationAction,
  },
} as const;

type ReviewReasonDialogProps = {
  mode: keyof typeof MODES;
  organization: { id: string; name: string };
  trigger: ReactElement;
  children: ReactNode;
};

/** Reject and suspend: both need a reason, which the owners see. */
export function ReviewReasonDialog({ mode, organization, trigger, children }: ReviewReasonDialogProps) {
  const config = MODES[mode];
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<ReviewReasonValues>({
    resolver: zodResolver(reviewReasonSchema),
    defaultValues: { reason: "" },
  });

  const onOpenChange = (next: boolean) => {
    if (isPending) return;
    setOpen(next);
    if (next) reset({ reason: "" });
  };

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await config.action(organization.id, values);
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
            <DialogTitle>{config.title(organization.name)}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          {mode === "suspend" && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg bg-destructive/5 p-3 text-sm ring-1 ring-destructive/30 [&_svg]:size-4"
            >
              <IconAlertTriangle aria-hidden className="mt-0.5 shrink-0 text-destructive" />
              <p>All of this organization&apos;s QR codes will stop redirecting.</p>
            </div>
          )}

          <Controller
            name="reason"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${mode}-reason`}>Reason</FieldLabel>
                <Textarea
                  {...field}
                  id={`${mode}-reason`}
                  rows={4}
                  maxLength={REVIEW_REASON_MAX}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>Shown to the organization&apos;s owners.</FieldDescription>
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>Cancel</DialogClose>
            <FormButton type="submit" variant="destructive" isPending={isPending}>
              {config.confirm}
            </FormButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
