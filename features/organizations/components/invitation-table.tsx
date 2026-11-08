"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { IconMailForward, IconX } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cancelInvitationAction, resendInvitationAction } from "@/features/organizations/actions/manage-members";
import { useAccess } from "@/features/organizations/components/access-provider";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import type { InvitationRow } from "@/features/organizations/libs/settings-types";

type InvitationTableProps = {
  organizationSlug: string;
  invitations: InvitationRow[];
};

export function InvitationTable({ organizationSlug, invitations }: InvitationTableProps) {
  const access = useAccess();
  const canManage = access.can({ invitation: ["create"] }) || access.can({ invitation: ["cancel"] });

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Expires</TableHead>
          {canManage && <TableHead className="pr-4 text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell className="pl-4 font-medium">{invitation.email}</TableCell>
            <TableCell>
              <RoleBadge role={invitation.role} />
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {invitation.expired ? <Badge variant="destructive">Expired</Badge> : invitation.expiresAt}
            </TableCell>
            {canManage && (
              <TableCell className="pr-4">
                <InvitationRowActions organizationSlug={organizationSlug} invitation={invitation} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InvitationRowActions({ organizationSlug, invitation }: { organizationSlug: string; invitation: InvitationRow }) {
  const access = useAccess();
  const [isPending, startTransition] = useTransition();

  const run = (action: typeof resendInvitationAction) =>
    startTransition(async () => {
      const result = await action(organizationSlug, invitation.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });

  return (
    <div className="flex items-center justify-end gap-1">
      {access.can({ invitation: ["create"] }) && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                aria-label={`Resend to ${invitation.email}`}
                onClick={() => run(resendInvitationAction)}
              />
            }
          >
            <IconMailForward />
          </TooltipTrigger>
          <TooltipContent>{invitation.expired ? "Resend and renew" : "Resend invitation"}</TooltipContent>
        </Tooltip>
      )}
      {access.can({ invitation: ["cancel"] }) && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                className="text-destructive hover:text-destructive"
                aria-label={`Cancel invitation for ${invitation.email}`}
                onClick={() => run(cancelInvitationAction)}
              />
            }
          >
            <IconX />
          </TooltipTrigger>
          <TooltipContent>Cancel invitation</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
