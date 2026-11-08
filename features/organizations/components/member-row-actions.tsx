"use client";

import { useState } from "react";
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
import { ORGANIZATION_ROLES, ROLE_DETAILS, parseRoles } from "@/features/organizations/libs/roles";
import { PENDING_ACTION_MESSAGE, type MemberRow } from "@/features/organizations/libs/settings-types";

type MemberRowActionsProps = {
  member: MemberRow;
  /** owners can assign the owner role and act on other owners */
  viewerIsOwner: boolean;
};

export function MemberRowActions({ member, viewerIsOwner }: MemberRowActionsProps) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const currentRole = parseRoles(member.role)[0] ?? "member";

  // TODO: updateMemberRoleAction / removeMemberAction
  const pending = () => toast.info(PENDING_ACTION_MESSAGE);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Manage ${member.name}`} />}
        >
          <IconDots />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">{member.name}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconShieldCog />
              Change role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64">
              <DropdownMenuRadioGroup
                value={currentRole}
                onValueChange={(role) => role !== currentRole && pending()}
              >
                {ORGANIZATION_ROLES.map((role) => (
                  <DropdownMenuRadioItem
                    key={role}
                    value={role}
                    disabled={role === "owner" && !viewerIsOwner}
                    className="items-start"
                  >
                    <span className="flex flex-col gap-0.5">
                      <span>{ROLE_DETAILS[role].label}</span>
                      <span className="text-xs text-muted-foreground">{ROLE_DETAILS[role].description}</span>
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setRemoveOpen(true)}>
            <IconUserMinus />
            Remove from organization
          </DropdownMenuItem>
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
            <AlertDialogAction variant="destructive" onClick={pending}>
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
