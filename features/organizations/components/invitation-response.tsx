"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { FormButton } from "@/components/shared/button/button";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction, rejectInvitationAction } from "@/features/organizations/actions/respond-invitation";

export function InvitationResponse({ invitationId }: { invitationId: string }) {
  const [isAccepting, startAccepting] = useTransition();
  const [isDeclining, startDeclining] = useTransition();
  const busy = isAccepting || isDeclining;

  // both redirect on success
  const accept = () =>
    startAccepting(async () => {
      const result = await acceptInvitationAction(invitationId);
      if (!result.success) toast.error(result.message);
    });

  const decline = () =>
    startDeclining(async () => {
      const result = await rejectInvitationAction(invitationId);
      if (!result.success) toast.error(result.message);
    });

  return (
    <div className="flex flex-col gap-2">
      <FormButton isPending={isAccepting} disabled={busy} onClick={accept}>
        Accept invitation
      </FormButton>
      <Button variant="ghost" disabled={busy} onClick={decline}>
        {isDeclining ? "Declining…" : "Decline"}
      </Button>
    </div>
  );
}
