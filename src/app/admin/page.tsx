import FilterSection from "@/components/dashboard/FilterSection";
import QrTable from "@/components/dashboard/QrTable";
import PagePagination from "@/components/pagination/PagePagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import db from "../../../db/db";
import { Prisma } from "@prisma/client";


export default async function DashboardPage({
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

export type QrTableProps = Prisma.QrLinksGetPayload<{
  include: { admin: true };
}>;

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
          AND: [{ name: { contains: q || undefined } }, { isTrashed: false }],
        },
        include: {
          admin: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.qrLinks.count({
        where: {
          AND: [{ name: { contains: q || undefined } }, { isTrashed: false }],
        },
      }),
    ]);
  } catch (error) {
    console.log(error);
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
