"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cancelSubscriptionAction } from "@/features/admin/actions/manage-subscription";
import { REVIEW_REASON_MAX } from "@/features/admin/schemas/review-organization";

type CancelSubscriptionDialogProps = {
  organization: { id: string; name: string };
  planName: string;
  defaultPlanName: string;
};

/** Cancels at once; the organization falls back to the default plan's limits. */
export function CancelSubscriptionDialog({ organization, planName, defaultPlanName }: CancelSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const onOpenChange = (next: boolean) => {
    if (isPending) return;
    setOpen(next);
    if (next) setReason("");
  };

  const cancel = () =>
    startTransition(async () => {
      const result = await cancelSubscriptionAction(organization.id, { reason });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setOpen(false);
      toast.success(result.message);
    });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger render={<Button size="sm" variant="outline" />}>Cancel subscription</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel {organization.name}&apos;s {planName} plan?</AlertDialogTitle>
          <AlertDialogDescription>
            It falls back to {defaultPlanName} limits at once. Nothing is deleted, but adding more QR codes, members
            or roles is blocked while it&apos;s over those limits. No email is sent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="cancel-reason">Reason (optional)</FieldLabel>
          <Textarea
            id="cancel-reason"
            rows={3}
            value={reason}
            maxLength={REVIEW_REASON_MAX}
            onChange={(event) => setReason(event.target.value)}
            disabled={isPending}
          />
          <FieldDescription>Recorded in the admin audit log only.</FieldDescription>
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep subscription</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={cancel}>
            {isPending ? "Canceling…" : "Cancel subscription"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
