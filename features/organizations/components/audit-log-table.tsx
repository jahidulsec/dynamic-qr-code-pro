import { IconHistory } from "@tabler/icons-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AUDIT_ACTIONS, type AuditLogRow } from "@/features/organizations/libs/audit-actions";

export function AuditLogTable({ rows, emptyMessage }: { rows: AuditLogRow[]; emptyMessage: string }) {
  if (!rows.length)
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-sm text-muted-foreground">
        <IconHistory className="size-8" />
        {emptyMessage}
      </div>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">Change</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="pr-4 text-right">When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="pl-4">
              <span className="font-medium">{row.actorName}</span>{" "}
              <span className="text-muted-foreground">{AUDIT_ACTIONS[row.action]}</span>{" "}
              <span className="font-medium">{row.targetLabel}</span>
            </TableCell>
            <TableCell className="max-w-80 truncate text-xs text-muted-foreground" title={row.detail ?? undefined}>
              {row.detail ?? "—"}
            </TableCell>
            <TableCell className="pr-4 text-right font-mono text-xs whitespace-nowrap text-muted-foreground">
              {row.createdAt}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
