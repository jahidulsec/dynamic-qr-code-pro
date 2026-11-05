import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { QR_PAGE_SIZE } from "@/features/qr/constants";

type QrPaginationProps = {
  page: number;
  pageCount: number;
  count: number;
  hrefFor: (page: number) => string;
};

export function QrPagination({ page, pageCount, count, hrefFor }: QrPaginationProps) {
  if (!count) return null;
  const from = (page - 1) * QR_PAGE_SIZE + 1;
  const to = Math.min(count, page * QR_PAGE_SIZE);

  return (
    <div className="flex items-center justify-between gap-2 border-t px-4 py-3 text-sm text-muted-foreground">
      <span className="font-mono text-xs">
        {from}–{to} of {count}
      </span>
      <div className="flex gap-2">
        <PageButton href={page > 1 ? hrefFor(page - 1) : null} label="Previous page">
          <IconChevronLeft />
        </PageButton>
        <PageButton href={page < pageCount ? hrefFor(page + 1) : null} label="Next page">
          <IconChevronRight />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  if (!href)
    return (
      <Button variant="outline" size="icon-sm" disabled aria-label={label}>
        {children}
      </Button>
    );
  return (
    <Button variant="outline" size="icon-sm" aria-label={label} render={<Link href={href} />} nativeButton={false}>
      {children}
    </Button>
  );
}
