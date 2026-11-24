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
import { revokeUserSessionsAction, unbanUserAction } from "@/features/admin/actions/manage-users";
import { BanUserDialog } from "@/features/admin/components/ban-user-dialog";

type UserRowActionsProps = {
  user: { id: string; name: string; email: string; isSelf: boolean; canBan: boolean; ban: unknown };
};

/**
 * Ban, Unban and Revoke sessions. Ban is hidden for yourself and for superadmins, and Revoke sessions for
 * yourself (spec 04); the server refuses both regardless.
 */
export function UserRowActions({ user }: UserRowActionsProps) {
  const name = user.name || user.email;

  return (
    <div className="flex items-center justify-end gap-2">
      {user.canBan && <BanUserDialog user={{ id: user.id, name }} />}
      {!!user.ban && (
        <ConfirmButton
          label="Unban"
          title={`Unban ${name}?`}
          description="They can sign in again straight away."
          confirm="Unban"
          run={() => unbanUserAction(user.id)}
        />
      )}
      {!user.isSelf && (
        <ConfirmButton
          label="Revoke sessions"
          title={`Sign ${name} out everywhere?`}
          description="Every session on every device ends. They can sign in again unless they're banned."
          confirm="Revoke sessions"
          run={() => revokeUserSessionsAction(user.id)}
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
