import Link from "next/link";
import { IconQrcode } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrRowActions } from "@/features/qr/components/qr-row-actions";
import type { QrListItem } from "@/features/qr/services/get-qrs";
import { formatCreatedDate, formatDate, shortLinkLabel } from "@/utils/format";

type QrTableProps = {
  items: QrListItem[];
  organizationSlug: string;
  baseUrl: string;
  hrefWith: (changes: Record<string, string | null>) => string;
  emptyMessage: React.ReactNode;
};

export function QrTable({ items, organizationSlug, baseUrl, hrefWith, emptyMessage }: QrTableProps) {
  if (!items.length)
    return (
      <div className="flex flex-col items-center gap-2 border-t px-4 py-16 text-center text-sm text-muted-foreground">
        <IconQrcode className="size-8" />
        {emptyMessage}
      </div>
    );

  const now = new Date();

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead className="text-right">Scans</TableHead>
          <TableHead>Tag</TableHead>
          <TableHead>Created by</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="pr-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((qr) => {
          const expired = !!qr.expiresAt && qr.expiresAt <= now;
          const statsHref = hrefWith({ stats: String(qr.id) });

          return (
            <TableRow key={qr.id}>
              <TableCell className="pl-4 font-mono font-medium">#&nbsp;{qr.id}</TableCell>
              <TableCell className="max-w-64">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium" title={qr.name}>
                    {qr.name}
                  </span>
                  {qr.status === "PAUSED" && <Badge variant="secondary">Paused</Badge>}
                  {expired && <Badge variant="destructive">Expired</Badge>}
                </div>
                <div className="truncate font-mono text-xs text-muted-foreground">{shortLinkLabel(baseUrl, qr.slug)}</div>
                {qr.expiresAt && !expired && (
                  <div className="text-xs text-muted-foreground">Expires {formatDate(qr.expiresAt)}</div>
                )}
              </TableCell>
              <TableCell className="max-w-64">
                <span className="block truncate font-mono text-xs" title={qr.destination}>
                  {qr.destination}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link href={statsHref} scroll={false} className="font-mono font-medium tabular-nums hover:underline">
                  {qr.scanCount.toLocaleString()}
                </Link>
              </TableCell>
              <TableCell className="font-mono text-xs font-medium">{qr.tag?.name ?? "—"}</TableCell>
              <TableCell>{qr.createdBy.name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{formatCreatedDate(qr.createdAt)}</TableCell>
              <TableCell className="pr-4">
                <QrRowActions
                  organizationSlug={organizationSlug}
                  qr={{ id: qr.id, name: qr.name, destination: qr.destination, status: qr.status }}
                  editHref={hrefWith({ edit: String(qr.id) })}
                  statsHref={statsHref}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
