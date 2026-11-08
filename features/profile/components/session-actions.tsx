"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { IconLogout } from "@tabler/icons-react";

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
import { revokeOtherSessionsAction, revokeSessionAction } from "@/features/profile/actions/manage-sessions";

// runs an action, toasts its result and lets the caller reload on success
const useRun = (onDone: () => void) => {
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<{ success: boolean; message: string }>) =>
    startTransition(async () => {
      const result = await action();
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      onDone();
    });

  return [isPending, run] as const;
};

export function RevokeSessionButton({ sessionId, onDone }: { sessionId: string; onDone: () => void }) {
  const [isPending, run] = useRun(onDone);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={() => run(() => revokeSessionAction(sessionId))}
    >
      <IconLogout data-icon="inline-start" />
      <span className="hidden sm:inline">Sign out</span>
      <span className="sr-only sm:hidden">Sign out this device</span>
    </Button>
  );
}

export function RevokeOtherSessionsButton({ onDone }: { onDone: () => void }) {
  const [isPending, run] = useRun(onDone);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            disabled={isPending}
          />
        }
      >
        <IconLogout data-icon="inline-start" />
        Sign out other devices
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of every other device?</AlertDialogTitle>
          <AlertDialogDescription>
            You stay signed in here. Everywhere else will need your password to sign back in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => run(revokeOtherSessionsAction)}>
            Sign out others
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
