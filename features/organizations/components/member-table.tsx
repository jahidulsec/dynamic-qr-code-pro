"use client";

import { useMemo, useState } from "react";
import { IconSearch, IconUsers } from "@tabler/icons-react";

import { Select } from "@/components/shared/select/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MemberRowActions } from "@/features/organizations/components/member-row-actions";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { ORGANIZATION_ROLES, ROLE_DETAILS, isOwnerRole, parseRoles } from "@/features/organizations/libs/roles";
import type { MemberRow } from "@/features/organizations/libs/settings-types";
import { initialsOf } from "@/features/profile";

const ROLE_FILTERS = ORGANIZATION_ROLES.map((role) => ({ value: role, label: ROLE_DETAILS[role].label }));

type MemberTableProps = {
  organizationSlug: string;
  members: MemberRow[];
  currentUserId: string;
  /** owners and admins see row actions */
  canManage: boolean;
  viewerIsOwner: boolean;
  /** pre-selected role filter, e.g. from a Roles page link */
  initialRole?: string | null;
};

export function MemberTable({
  organizationSlug,
  members,
  currentUserId,
  canManage,
  viewerIsOwner,
  initialRole,
}: MemberTableProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string | null>(initialRole ?? null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members.filter(
      (member) =>
        (!role || parseRoles(member.role).includes(role as never)) &&
        (!needle || member.name.toLowerCase().includes(needle) || member.email.toLowerCase().includes(needle)),
    );
  }, [members, query, role]);

  // admins can't act on owners, and nobody manages themselves here
  const canActOn = (member: MemberRow) =>
    canManage && member.userId !== currentUserId && (viewerIsOwner || !isOwnerRole(member.role));

  return (
    <>
      <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute inset-y-0 left-2.5 my-auto size-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search members"
            className="pl-8"
          />
        </div>
        <Select
          data={ROLE_FILTERS}
          value={role}
          onValueChange={setRole}
          placeholder="All roles"
          aria-label="Filter by role"
          className="sm:w-40"
        />
      </div>

      {filtered.length ? (
        <Table>
          <TableHeader>
            <TableRow className="text-xs uppercase">
              <TableHead className="pl-4">Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {canManage && <TableHead className="pr-4 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="pl-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={member.image ?? undefined} alt="" />
                      <AvatarFallback className="text-xs">{initialsOf(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-2 truncate font-medium">
                        {member.name}
                        {member.userId === currentUserId && (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                            You
                          </Badge>
                        )}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={member.role} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{member.joinedAt}</TableCell>
                {canManage && (
                  <TableCell className="pr-4">
                    {canActOn(member) && (
                      <MemberRowActions
                        organizationSlug={organizationSlug}
                        member={member}
                        viewerIsOwner={viewerIsOwner}
                      />
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-sm text-muted-foreground">
          <IconUsers className="size-8" />
          No members match these filters.
        </div>
      )}
    </>
  );
}
