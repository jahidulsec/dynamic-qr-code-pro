import QrTable from "@/components/dashboard/QrTable";
import PagePagination from "@/components/pagination/PagePagination";
import TrashHeader from "@/components/trash/Header";
import React, { Suspense } from "react";
import db from "../../../../db/db";
import { TableSkeleton } from "@/components/ui/skeleton";
import { QrTableProps } from "../page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trash - Dynamic QR Code Pro",
};

export default function TrashPage({
  searchParams,
}: {
  searchParams: { q: string; p: string };
}) {
  return (
    <>
      <TrashHeader />
      {/* table */}
      <Suspense fallback={<TableSkeleton />}>
        <DataTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function DataTable({
  searchParams,
}: {
  searchParams: { q: string; p: string };
}) {
  const { q, p } = await searchParams;

  const limit = 20;
  const page = Number(p ?? 1) || 1;

  let qrLinks: QrTableProps[], count: number;

  try {
    [qrLinks, count] = await Promise.all([
      db.qrLinks.findMany({
        where: {
          AND: [
            { name: { contains: q || undefined } },
            { isTrashed: true },
          ],
        },
        include: { admin: true },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.qrLinks.count({
        where: {
          AND: [
            { name: { contains: q || undefined } },
            { isTrashed: true },
          ],
        },
      }),
    ]);
  } catch (error) {
    qrLinks = [];
    count = 0;
  }

  return (
    <>
      <QrTable qrLinks={qrLinks} />

      <div className="border-t pt-5">
        <PagePagination limit={20} count={count} />
      </div>
    </>
  );
}
