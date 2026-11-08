"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { IconDots, IconShieldCog, IconUserMinus } from "@tabler/icons-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccess } from "@/features/organizations/components/access-provider";
import { cannotAssignReason, parseRoles } from "@/features/organizations/libs/roles";
import { removeMemberAction, updateMemberRoleAction } from "@/features/organizations/actions/manage-members";
import type { MemberRow } from "@/features/organizations/libs/settings-types";

type MemberRowActionsProps = {
  organizationSlug: string;
  member: MemberRow;
};

export function MemberRowActions({ organizationSlug, member }: MemberRowActionsProps) {
  const access = useAccess();
  const canChangeRole = access.can({ member: ["update"] });
  const canRemove = access.can({ member: ["delete"] });
  const [removeOpen, setRemoveOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentRole = parseRoles(member.role)[0] ?? "member";

  const changeRole = (role: string) => {
    if (role === currentRole) return;
    startTransition(async () => {
      const result = await updateMemberRoleAction(organizationSlug, member.id, role);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  // the dialog stays open while the request runs so a failure keeps its context
  const removeMember = () =>
    startTransition(async () => {
      const result = await removeMemberAction(organizationSlug, member.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setRemoveOpen(false);
      toast.success(result.message);
    });

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" disabled={isPending} aria-label={`Manage ${member.name}`} />
                }
              />
            }
          >
            <IconDots />
          </TooltipTrigger>
          <TooltipContent>Manage member</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">{member.name}</DropdownMenuLabel>
          </DropdownMenuGroup>
          {canChangeRole && <DropdownMenuSeparator />}
          {canChangeRole && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconShieldCog />
                Change role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                <DropdownMenuRadioGroup
                  value={currentRole}
                  onValueChange={changeRole}
                >
                  {access.roles.map((role) => {
                    const reason = cannotAssignReason(access, role);
                    return (
                      <DropdownMenuRadioItem key={role.key} value={role.key} disabled={!!reason} className="items-start">
                        <span className="flex flex-col gap-0.5">
                          <span>{role.label}</span>
                          <span className="text-xs text-muted-foreground">{reason ?? role.description}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {canRemove && <DropdownMenuSeparator />}
          {canRemove && (
            <DropdownMenuItem variant="destructive" onClick={() => setRemoveOpen(true)}>
              <IconUserMinus />
              Remove from organization
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {member.email} loses access straight away. QR codes they created stay with the organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isPending} onClick={removeMember}>
              {isPending ? "Removing…" : "Remove member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
