import Link from "next/link";
import { IconCheck, IconLock, IconMinus } from "@tabler/icons-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { RoleCardActions } from "@/features/organizations/components/role-card-actions";
import type { RoleInfo } from "@/features/organizations/libs/roles";
import { countPermissions, PERMISSION_CATALOGUE, type Resource } from "@/lib/auth/permissions";

type RoleSummaryProps = {
  organizationSlug: string;
  roles: RoleInfo[];
  counts: Record<string, number>;
};

const grants = (role: RoleInfo, resource: Resource, action: string) =>
  (role.permissions[resource] as readonly string[] | undefined)?.includes(action) ?? false;

export function RoleSummary({ organizationSlug, roles, counts }: RoleSummaryProps) {
  const membersHref = (role: string) => `/${organizationSlug}/settings/members?${new URLSearchParams({ role })}`;

  return (
    <div className="grid gap-px overflow-hidden bg-border sm:grid-cols-2 xl:grid-cols-4">
      {roles.map((role) => {
        const count = counts[role.key] ?? 0;
        return (
          <div key={role.key} className="flex flex-col gap-3 bg-card p-5">
            <div className="flex min-h-7 items-center justify-between gap-2">
              <RoleBadge role={role.key} />
              {role.system ? (
                <IconLock className="size-3.5 text-muted-foreground" aria-label="Built-in role" />
              ) : (
                <RoleCardActions organizationSlug={organizationSlug} role={role} memberCount={count} />
              )}
            </div>
            <p className="flex-1 text-sm text-muted-foreground">{role.description || "No description."}</p>
            <div className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground tabular-nums">
              <Link href={membersHref(role.key)} className="hover:text-foreground hover:underline">
                {count} {count === 1 ? "member" : "members"}
              </Link>
              <span>{countPermissions(role.permissions)} permissions</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RolePermissionMatrix({ roles }: { roles: RoleInfo[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">Permission</TableHead>
          {roles.map((role) => (
            <TableHead key={role.key} className="w-24 text-center whitespace-nowrap last:pr-4">
              {role.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {PERMISSION_CATALOGUE.map((group) => [
          <TableRow key={group.resource} className="bg-muted/40 hover:bg-muted/40">
            <TableCell colSpan={roles.length + 1} className="pl-4 text-xs font-semibold tracking-wider uppercase">
              {group.label}
            </TableCell>
          </TableRow>,
          ...group.actions.map(({ action, label }) => (
            <TableRow key={`${group.resource}-${action}`}>
              <TableCell className="pl-4 whitespace-nowrap">{label}</TableCell>
              {roles.map((role) => (
                <TableCell key={role.key} className="text-center last:pr-4">
                  {grants(role, group.resource, action) ? (
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
