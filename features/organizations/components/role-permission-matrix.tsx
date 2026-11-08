import Link from "next/link";
import { IconCheck, IconMinus } from "@tabler/icons-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ORGANIZATION_ROLES, PERMISSION_GROUPS, ROLE_DETAILS, type OrganizationRole } from "@/features/organizations/libs/roles";
import { RoleBadge } from "@/features/organizations/components/role-badge";

type RoleSummaryProps = {
  counts: Record<OrganizationRole, number>;
  membersHref: (role: OrganizationRole) => string;
};

export function RoleSummary({ counts, membersHref }: RoleSummaryProps) {
  return (
    <div className="grid gap-px overflow-hidden bg-border sm:grid-cols-3">
      {ORGANIZATION_ROLES.map((role) => (
        <div key={role} className="flex flex-col gap-3 bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <RoleBadge role={role} />
            <Link
              href={membersHref(role)}
              className="font-mono text-xs text-muted-foreground tabular-nums hover:text-foreground hover:underline"
            >
              {counts[role]} {counts[role] === 1 ? "member" : "members"}
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">{ROLE_DETAILS[role].description}</p>
        </div>
      ))}
    </div>
  );
}

export function RolePermissionMatrix() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">Permission</TableHead>
          {ORGANIZATION_ROLES.map((role) => (
            <TableHead key={role} className="w-24 text-center last:pr-4">
              {ROLE_DETAILS[role].label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {PERMISSION_GROUPS.map((group) => [
          <TableRow key={group.label} className="bg-muted/40 hover:bg-muted/40">
            <TableCell colSpan={ORGANIZATION_ROLES.length + 1} className="pl-4 text-xs font-semibold tracking-wider uppercase">
              {group.label}
            </TableCell>
          </TableRow>,
          ...group.permissions.map((permission) => (
            <TableRow key={`${group.label}-${permission.action}`}>
              <TableCell className="pl-4">{permission.action}</TableCell>
              {ORGANIZATION_ROLES.map((role) => (
                <TableCell key={role} className="text-center last:pr-4">
                  {permission.roles.includes(role) ? (
                    <IconCheck className="mx-auto size-4 text-success" aria-label="Allowed" />
                  ) : (
                    <IconMinus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not allowed" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          )),
        ])}
      </TableBody>
    </Table>
  );
}
