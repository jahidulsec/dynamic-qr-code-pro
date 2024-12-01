import QrTable from "@/components/dashboard/QrTable";
import PagePagination from "@/components/pagination/PagePagination";
import TrashHeader from "@/components/trash/Header";
import React, { Suspense } from "react";
import db from "../../../../db/db";
import { QrLinks } from "@prisma/client";
import { TableSkeleton } from "@/components/ui/skeleton";

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
  const limit = 20;
  const page = Number(searchParams?.p ?? 1) || 1;

  let qrLinks: QrLinks[], count: number;

  try {
    [qrLinks, count] = await Promise.all([
      db.qrLinks.findMany({
        where: {
          AND: [
            { name: { contains: searchParams.q || undefined } },
            { isTrashed: true },
          ],
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.qrLinks.count({
        where: {
          AND: [
            { name: { contains: searchParams.q || undefined } },
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
