import { IconHistory } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ADMIN_AUDIT_ACTIONS, type AdminAuditAction } from "@/features/admin/libs/admin-audit-actions";
import type { getAdminAuditLog } from "@/features/admin/libs/admin-audit-log";
import { formatDate } from "@/utils/format";

export type AdminAuditLogItem = NonNullable<Awaited<ReturnType<typeof getAdminAuditLog>>["data"]>["items"][number];

// renders on the server only: dates are formatted in the server's time zone
const formatDateTime = (date: Date) =>
  `${formatDate(date)}, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

type AdminAuditLogTableProps = {
  items: AdminAuditLogItem[];
  emptyMessage: React.ReactNode;
};

/** /admin/audit-log rows: each reads as a sentence ("Jahid approved the organization Acme") over its details line. */
export function AdminAuditLogTable({ items, emptyMessage }: AdminAuditLogTableProps) {
  if (!items.length)
    return (
      <div className="flex flex-col items-center gap-2 border-t px-4 py-16 text-center text-sm text-muted-foreground">
        <IconHistory className="size-8" />
        {emptyMessage}
      </div>
    );

  return (
    // the table's own container scrolls sideways, so a phone scrolls the card, not the page
    <Table>
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">Change</TableHead>
          <TableHead>Target</TableHead>
          <TableHead className="pr-4 text-right">When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="min-w-72 max-w-xl pl-4 whitespace-normal">
              <p className="break-words">
                <span className="font-medium">{entry.actorName}</span>{" "}
                <span className="text-muted-foreground">
                  {ADMIN_AUDIT_ACTIONS[entry.action as AdminAuditAction] ?? entry.action}
                </span>{" "}
                <span className="font-medium">{entry.targetLabel}</span>
              </p>
              {entry.detail && <p className="mt-0.5 text-xs break-words text-muted-foreground">{entry.detail}</p>}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <Badge variant="outline" className="capitalize">
                {entry.targetType}
              </Badge>
            </TableCell>
            <TableCell className="pr-4 text-right font-mono text-xs whitespace-nowrap text-muted-foreground">
              {formatDateTime(entry.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
