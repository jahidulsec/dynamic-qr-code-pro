"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteRoleAction } from "@/features/organizations/actions/manage-roles";
import { useAccess } from "@/features/organizations/components/access-provider";
import { RoleFormDialog } from "@/features/organizations/components/role-form-dialog";
import type { RoleInfo } from "@/features/organizations/libs/roles";

type RoleCardActionsProps = {
  organizationSlug: string;
  role: RoleInfo;
  /** members holding the role; it can't be deleted while any do */
  memberCount: number;
};

export function RoleCardActions({ organizationSlug, role, memberCount }: RoleCardActionsProps) {
  const access = useAccess();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // roles reaching beyond the viewer's own access stay out of their hands; the server checks the same
  const withinReach = access.can(role.permissions);
  const canEdit = withinReach && access.can({ ac: ["update"] });
  const canDelete = withinReach && access.can({ ac: ["delete"] });
  if (!canEdit && !canDelete) return null;

  const deleteRole = () =>
    startTransition(async () => {
      const result = await deleteRoleAction(organizationSlug, role.key);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setDeleteOpen(false);
      toast.success(result.message);
    });

  return (
    <div className="flex items-center gap-1">
      {canEdit && (
        <RoleFormDialog
          organizationSlug={organizationSlug}
          role={role}
          trigger={<Button variant="ghost" size="icon-sm" aria-label={`Edit ${role.label}`} title="Edit role" />}
        >
          <IconPencil />
        </RoleFormDialog>
      )}
      {canDelete && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                aria-label={`Delete ${role.label}`}
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
              />
            }
          >
            <IconTrash />
          </TooltipTrigger>
          <TooltipContent>Delete role</TooltipContent>
        </Tooltip>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {role.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberCount > 0
                ? `${memberCount} ${memberCount === 1 ? "member has" : "members have"} this role. Give them another role before deleting it.`
                : "Nobody has this role. Deleting it can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isPending || memberCount > 0} onClick={deleteRole}>
              {isPending ? "Deleting…" : "Delete role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
