"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconArrowDown, IconArrowUp, IconArrowsSort } from "@tabler/icons-react";

import { TableHead } from "@/components/ui/table";
import {
  QR_DEFAULT_SORT,
  QR_SORT_FIELDS,
  QR_SORT_ORDERS,
  type QrSortField,
  type QrSortOrder,
} from "@/features/qr/schemas/qr-schema";
import { cn } from "@/lib/utils";

// numbers and dates read best biggest/newest first; text reads best A→Z
const firstOrder: Record<QrSortField, QrSortOrder> = {
  id: "asc",
  name: "asc",
  destination: "asc",
  scans: "desc",
  createdBy: "asc",
  created: "desc",
};

const pick = <T extends string>(values: readonly T[], value: string | null, fallback: T) =>
  values.includes(value as T) ? (value as T) : fallback;

type QrSortHeadProps = {
  field: QrSortField;
  children: React.ReactNode;
  className?: string;
};

/** a column header that sorts the dashboard list via ?sort=&order= (click again to flip) */
export function QrSortHead({ field, children, className }: QrSortHeadProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = pick(QR_SORT_FIELDS, searchParams.get("sort"), QR_DEFAULT_SORT.sort);
  const order = pick(QR_SORT_ORDERS, searchParams.get("order"), QR_DEFAULT_SORT.order);
  const active = sort === field;
  const next: QrSortOrder = active ? (order === "asc" ? "desc" : "asc") : firstOrder[field];

  const params = new URLSearchParams(searchParams.toString());
  // keep the URL clean when landing back on the default order
  if (field === QR_DEFAULT_SORT.sort && next === QR_DEFAULT_SORT.order) {
    params.delete("sort");
    params.delete("order");
  } else {
    params.set("sort", field);
    params.set("order", next);
  }
  params.delete("page");
  const query = params.toString();

  const Icon = !active ? IconArrowsSort : order === "asc" ? IconArrowUp : IconArrowDown;

  return (
    <TableHead
      className={className}
      aria-sort={active ? (order === "asc" ? "ascending" : "descending") : undefined}
    >
      <Link
        href={query ? `${pathname}?${query}` : pathname}
        replace
        scroll={false}
        className={cn(
          "group inline-flex items-center gap-1 uppercase hover:text-foreground",
          className?.includes("text-right") && "flex-row-reverse",
        )}
      >
        {children}
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            active ? "text-foreground" : "text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
          )}
          aria-hidden
        />
      </Link>
    </TableHead>
  );
}
