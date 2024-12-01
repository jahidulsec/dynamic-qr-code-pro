import FilterSection from "@/components/dashboard/FilterSection";
import QrTable from "@/components/dashboard/QrTable";
import PagePagination from "@/components/pagination/PagePagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import db from "../../../db/db";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { q: string; p: string };
}) {
  return (
    <div className="container my-6 mx-auto">
      <FilterSection />
      {/* table */}
      <Suspense fallback={<TableSkeleton />}>
        <DataTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DataTable({
  searchParams,
}: {
  searchParams: { q: string; p: string };
}) {
  const [qrLinks, count] = await Promise.all([
    db.qrLinks.findMany(),
    db.qrLinks.count(),
  ]);

  return (
    <>
      <QrTable qrLinks={qrLinks} />

      <div className="border-t pt-5">
        <PagePagination limit={20} count={count} />
      </div>
    </>
  );
}
