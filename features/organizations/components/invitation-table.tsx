"use client";

import { toast } from "sonner";
import { IconMailForward, IconX } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { PENDING_ACTION_MESSAGE, type InvitationRow } from "@/features/organizations/libs/settings-types";

export function InvitationTable({ invitations, canManage }: { invitations: InvitationRow[]; canManage: boolean }) {
  // TODO: resendInvitationAction / cancelInvitationAction
  const pending = () => toast.info(PENDING_ACTION_MESSAGE);

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
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={`Resend to ${invitation.email}`} onClick={pending}>
                    <IconMailForward />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Cancel invitation for ${invitation.email}`}
                    onClick={pending}
                  >
                    <IconX />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
