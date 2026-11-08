"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { IconRestore, IconTrashX } from "@tabler/icons-react";

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
import { deleteQrAction, restoreQrAction } from "@/features/qr/actions/manage-qr";

type TrashRowActionsProps = {
  organizationSlug: string;
  qr: { id: number; name: string };
  canRestore: boolean;
  canDelete: boolean;
};

export function TrashRowActions({ organizationSlug, qr, canRestore, canDelete }: TrashRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<{ success: boolean; message: string }>) =>
    startTransition(async () => {
      const result = await action();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });

  return (
    <div className="flex justify-end gap-2">
      {canRestore && (
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => restoreQrAction(organizationSlug, qr.id))}>
          <IconRestore data-icon="inline-start" />
          Restore
        </Button>
      )}
      {canDelete && (
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" size="sm" disabled={isPending} />}>
            <IconTrashX data-icon="inline-start" />
            Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{qr.name}&rdquo; permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                Its scan history is erased and printed copies will show &ldquo;doesn&apos;t exist&rdquo;. This can&apos;t be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => run(() => deleteQrAction(organizationSlug, qr.id))}>
                Delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
