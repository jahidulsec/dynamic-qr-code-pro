import { IconQrcode } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QrAnalyticsButton } from "@/features/qr/components/qr-analytics-button";
import { QrRowActions } from "@/features/qr/components/qr-row-actions";
import { qrTagNames, type QrListItem } from "@/features/qr/libs/qr-query";
import { parseQrStyle } from "@/features/qr/schemas/qr-schema";
import {
  formatCreatedDate,
  formatDate,
  shortLink,
  shortLinkLabel,
  formatTags,
  toDateInput,
} from "@/utils/format";

type QrTableProps = {
  items: QrListItem[];
  organizationSlug: string;
  baseUrl: string;
  tags: string[];
  emptyMessage: React.ReactNode;
};

export function QrTable({
  items,
  organizationSlug,
  baseUrl,
  tags,
  emptyMessage,
}: QrTableProps) {
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
          <TableHead>Tags</TableHead>
          <TableHead>Created by</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="pr-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((qr) => {
          const expired = !!qr.expiresAt && qr.expiresAt <= now;
          const style = parseQrStyle(qr.style);

          return (
            <TableRow key={qr.id}>
              <TableCell className="pl-4 font-mono font-medium">
                #&nbsp;{qr.id}
              </TableCell>
              <TableCell className="max-w-64">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium" title={qr.name}>
                    {qr.name}
                  </span>
                  {qr.status === "PAUSED" && (
                    <Badge variant="secondary">Paused</Badge>
                  )}
                  {expired && <Badge variant="destructive">Expired</Badge>}
                </div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {shortLinkLabel(baseUrl, qr.slug)}
                </div>
                {qr.expiresAt && !expired && (
                  <div className="text-xs text-muted-foreground">
                    Expires {formatDate(qr.expiresAt)}
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-64">
                {qr.type === "WEBSITE" ? (
                  <a
                    href={qr.destination}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-mono text-xs hover:underline"
                    title={qr.destination}
                  >
                    {qr.destination}
                  </a>
                ) : (
                  <span
                    className="block truncate font-mono text-xs"
                    title={qr.destination}
                  >
                    {qr.destination}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <QrAnalyticsButton
                  organizationSlug={organizationSlug}
                  qr={{ id: qr.id, name: qr.name, tags: qrTagNames(qr) }}
                  variant="link"
                  className="h-auto p-0 font-mono font-medium tabular-nums text-foreground"
                  aria-label={`Analytics for ${qr.name}`}
                >
                  {qr.scanCount.toLocaleString()}
                </QrAnalyticsButton>
              </TableCell>
              <TableCell className="font-mono text-xs font-medium">
                {formatTags(qrTagNames(qr))}
              </TableCell>
              <TableCell>{qr.createdBy.name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {formatCreatedDate(qr.createdAt)}
              </TableCell>
              <TableCell className="pr-4">
                <QrRowActions
                  organizationSlug={organizationSlug}
                  qr={{
                    id: qr.id,
                    name: qr.name,
                    slug: qr.slug,
                    destination: qr.destination,
                    status: qr.status,
                    tags: qrTagNames(qr),
                  }}
                  check={{
                    state: expired ? "expired" : qr.status === "PAUSED" ? "paused" : "ready",
                    createdBy: qr.createdBy.name,
                    scanCount: qr.scanCount,
                    createdLabel: formatCreatedDate(qr.createdAt),
                  }}
                  qrValue={shortLink(baseUrl, qr.slug)}
                  qrLabel={shortLinkLabel(baseUrl, qr.slug)}
                  qrStyle={style}
                  baseUrl={baseUrl}
                  tags={tags}
                  editValues={{
                    name: qr.name,
                    destination: qr.destination,
                    slug: qr.slug,
                    tags: qrTagNames(qr),
                    expiresAt: qr.expiresAt ? toDateInput(qr.expiresAt) : "",
                    style,
                  }}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
