import { IconUsers } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRowActions } from "@/features/admin/components/user-row-actions";
import type { getAdminUsers } from "@/features/admin/libs/admin-users";
import { formatDate } from "@/utils/format";

export type AdminUserListItem = NonNullable<Awaited<ReturnType<typeof getAdminUsers>>["data"]>["items"][number];

type AdminUserTableProps = {
  items: AdminUserListItem[];
  emptyMessage: React.ReactNode;
};

export function AdminUserTable({ items, emptyMessage }: AdminUserTableProps) {
  if (!items.length)
    return (
      <div className="flex flex-col items-center gap-2 border-t px-4 py-16 text-center text-sm text-muted-foreground">
        <IconUsers className="size-8" />
        {emptyMessage}
      </div>
    );

  return (
    // the table's own container scrolls sideways, so a phone scrolls the card, not the page
    <Table className="[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Organizations</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-4 text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="max-w-72 pl-4">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium" title={user.name}>
                  {user.name}
                </span>
                {user.isSelf && <Badge variant="ghost">You</Badge>}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate" title={user.email}>
                  {user.email}
                </span>
                {user.emailVerified ? <Badge variant="outline">Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}
              </div>
            </TableCell>
            <TableCell>
              {user.role === "superadmin" ? <Badge>superadmin</Badge> : <span className="text-muted-foreground">user</span>}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{user.organizationCount.toLocaleString()}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
            <TableCell>
              {user.ban ? (
                <div className="flex flex-col items-start gap-1" title={user.ban.reason ?? undefined}>
                  <Badge variant="destructive">Banned</Badge>
                  <span className="text-xs text-muted-foreground">
                    {user.ban.expiresAt ? `Until ${formatDate(user.ban.expiresAt)}` : "No expiry"}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="pr-4">
              <UserRowActions user={user} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
