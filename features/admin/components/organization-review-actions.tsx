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
import { reactivateOrganizationAction } from "@/features/admin/actions/review-organization";
import { ApproveOrganizationDialog, type SelectablePlan } from "@/features/admin/components/approve-organization-dialog";
import { ReviewReasonDialog } from "@/features/admin/components/review-reason-dialog";
import type { OrganizationStatus } from "@/generated/prisma/client";

type OrganizationReviewActionsProps = {
  organization: { id: string; name: string; status: OrganizationStatus };
  plans: SelectablePlan[];
};

/** The header's review actions, following spec 02's transitions for the current status. */
export function OrganizationReviewActions({ organization, plans }: OrganizationReviewActionsProps) {
  const { status } = organization;

  return (
    <>
      {(status === "PENDING" || status === "REJECTED") && (
        <ApproveOrganizationDialog organization={organization} plans={plans} trigger={<Button size="sm" />}>
          Approve
        </ApproveOrganizationDialog>
      )}
      {status === "PENDING" && (
        <ReviewReasonDialog mode="reject" organization={organization} trigger={<Button size="sm" variant="outline" />}>
          Reject
        </ReviewReasonDialog>
      )}
      {status === "ACTIVE" && (
        <ReviewReasonDialog
          mode="suspend"
          organization={organization}
          trigger={<Button size="sm" variant="destructive" />}
        >
          Suspend
        </ReviewReasonDialog>
      )}
      {status === "SUSPENDED" && <ReactivateButton organization={organization} />}
    </>
  );
}

function ReactivateButton({ organization }: { organization: { id: string; name: string } }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const reactivate = () =>
    startTransition(async () => {
      const result = await reactivateOrganizationAction(organization.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setOpen(false);
      toast.success(result.message);
    });

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <AlertDialogTrigger render={<Button size="sm" />}>Reactivate</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reactivate {organization.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Members get access again, its QR codes start redirecting, and the owners are emailed. The subscription
            stays as it is.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={reactivate}>
            {isPending ? "Reactivating…" : "Reactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
