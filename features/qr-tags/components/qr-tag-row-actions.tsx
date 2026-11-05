"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { IconPencil, IconTrashX } from "@tabler/icons-react";

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
import { deleteQrTagAction } from "@/features/qr-tags/actions/manage-qr-tag";
import { QrTagFormDialog } from "@/features/qr-tags/components/qr-tag-form-dialog";

type QrTagRowActionsProps = {
  organizationSlug: string;
  tag: { id: string; name: string; count: number };
};

export function QrTagRowActions({ organizationSlug, tag }: QrTagRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const onDelete = () =>
    startTransition(async () => {
      const result = await deleteQrTagAction(organizationSlug, tag.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });

  return (
    <div className="flex items-center justify-end gap-1">
      <QrTagFormDialog
        organizationSlug={organizationSlug}
        tag={tag}
        trigger={<Button variant="ghost" size="icon-sm" aria-label={`Rename ${tag.name}`} disabled={isPending} />}
      >
        <IconPencil />
      </QrTagFormDialog>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label={`Delete ${tag.name}`}
              disabled={isPending}
            />
          }
        >
          <IconTrashX />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag {tag.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {tag.count
                ? `${tag.count.toLocaleString()} QR ${tag.count === 1 ? "code loses" : "codes lose"} this tag. The codes themselves keep working.`
                : "No QR codes use this tag."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
