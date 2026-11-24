"use client";

import Link from "next/link";
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
import { archivePlanAction, setDefaultPlanAction, unarchivePlanAction } from "@/features/admin/actions/manage-plans";
import { ADMIN_PATHS } from "@/features/admin/constants";

type PlanRowActionsProps = {
  plan: { id: string; name: string; isDefault: boolean; archivedAt: Date | null; organizationCount: number };
};

/** Edit, Set as default, Archive / Unarchive. The default plan has no Archive action (spec 04). */
export function PlanRowActions({ plan }: PlanRowActionsProps) {
  const archived = !!plan.archivedAt;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`${ADMIN_PATHS.plans}/${plan.id}`} />}>
        Edit
      </Button>
      {!plan.isDefault && !archived && (
        <ConfirmButton
          label="Set as default"
          title={`Make ${plan.name} the default plan?`}
          description="Organizations without a subscription in effect (none, expired or canceled) use the default plan's limits straight away."
          confirm="Make default"
          run={() => setDefaultPlanAction(plan.id)}
        />
      )}
      {!plan.isDefault && !archived && (
        <ConfirmButton
          label="Archive"
          title={`Archive ${plan.name}?`}
          description={
            plan.organizationCount
              ? `It can't be assigned to more organizations. The ${plan.organizationCount} already on it stay on it.`
              : "It can't be assigned to organizations until it's unarchived."
          }
          confirm="Archive"
          run={() => archivePlanAction(plan.id)}
        />
      )}
      {archived && (
        <ConfirmButton
          label="Unarchive"
          title={`Unarchive ${plan.name}?`}
          description="It can be assigned to organizations again."
          confirm="Unarchive"
          run={() => unarchivePlanAction(plan.id)}
        />
      )}
    </div>
  );
}

type ConfirmButtonProps = {
  label: string;
  title: string;
  description: string;
  confirm: string;
  run: () => Promise<{ success: boolean; message: string }>;
};

function ConfirmButton({ label, title, description, confirm, run }: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () =>
    startTransition(async () => {
      const result = await run();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setOpen(false);
      toast.success(result.message);
    });

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <AlertDialogTrigger render={<Button size="sm" variant="ghost" />}>{label}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirm}>
            {isPending ? "Saving…" : confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
