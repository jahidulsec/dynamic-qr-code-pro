import FilterSection from "@/components/dashboard/FilterSection";
import QrTable from "@/components/dashboard/QrTable";
import PagePagination from "@/components/pagination/PagePagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import db from "../../../db/db";
import { QrLinks } from "@prisma/client";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { q: string; p: string };
}) {
  return (
    <>
      <FilterSection />
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
            { isTrashed: false },
          ],
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.qrLinks.count({
        where: {
          AND: [
            { name: { contains: searchParams.q || undefined } },
            { isTrashed: false },
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
