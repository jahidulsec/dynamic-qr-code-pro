import Link from "next/link";
import { IconTag } from "@tabler/icons-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrTagRowActions } from "@/features/qr-tags/components/qr-tag-row-actions";
import type { QrTagListItem } from "@/features/qr-tags/libs/qr-tags-query";
import { formatDate } from "@/utils/format";

type QrTagTableProps = {
  items: QrTagListItem[];
  organizationSlug: string;
  /** owners and admins can rename and delete */
  canManage: boolean;
  /** the dashboard filtered to one tag */
  codesHref: (name: string) => string;
  emptyMessage: string;
};

export function QrTagTable({ items, organizationSlug, canManage, codesHref, emptyMessage }: QrTagTableProps) {
  if (!items.length)
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-sm text-muted-foreground">
        <IconTag className="size-8" />
        {emptyMessage}
      </div>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">Tag</TableHead>
          <TableHead className="text-right">QR codes</TableHead>
          <TableHead>Created</TableHead>
          {canManage && <TableHead className="pr-4 text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((tag) => (
          <TableRow key={tag.id}>
            <TableCell className="pl-4 font-mono font-medium">
              <Link href={codesHref(tag.name)} className="hover:underline hover:underline-offset-2">
                {tag.name}
              </Link>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{tag.count.toLocaleString()}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(tag.createdAt)}</TableCell>
            {canManage && (
              <TableCell className="pr-4">
                <QrTagRowActions organizationSlug={organizationSlug} tag={tag} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
