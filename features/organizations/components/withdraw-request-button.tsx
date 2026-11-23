"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { withdrawOrganizationRequestAction } from "@/features/organizations/actions/withdraw-organization-request";

type WithdrawRequestButtonProps = {
  organization: { id: string; name: string; slug: string };
  /** where to go once the request is gone; omit to stay (the row just leaves the list) */
  redirectTo?: string;
};

export function WithdrawRequestButton({ organization, redirectTo }: WithdrawRequestButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isWithdrawing, startWithdrawing] = useTransition();

  // the dialog stays open while the request runs; on success the row leaves the list
  const withdraw = () =>
    startWithdrawing(async () => {
      const result = await withdrawOrganizationRequestAction(organization.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setOpen(false);
      toast.success(result.message);
      // in the same transition, so the refreshed (now 404) page never shows
      if (redirectTo) router.replace(redirectTo);
    });

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isWithdrawing && setOpen(next)}>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>Withdraw request</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw the request for {organization.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            The request is deleted and <span className="font-mono">/{organization.slug}</span> becomes available
            again. You can submit a new request at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isWithdrawing}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isWithdrawing} onClick={withdraw}>
            {isWithdrawing ? "Withdrawing…" : "Withdraw request"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
