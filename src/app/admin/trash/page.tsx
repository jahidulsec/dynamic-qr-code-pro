import QrTable from "@/components/dashboard/QrTable";
import PagePagination from "@/components/pagination/PagePagination";
import TrashHeader from "@/components/trash/Header";
import React, { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { getQRlist } from "@/servers/lib/qr";

export const metadata: Metadata = {
  title: "Trash - Dynamic QR Code Pro",
};

export default function TrashPage({
  searchParams,
}: {
  searchParams: { search: string; p: string; size: string };
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
  searchParams: { search: string; p: string; size: string };
}) {
  const { search, p, size } = await searchParams;

  const limit = Number(size || 20);

  const res = await getQRlist({
    page: Number(p || 1),
    size: limit,
    search,
    isTrash: "yes",
  });

  return (
    <>
      <QrTable count={res.count} limit={limit} qrLinks={res.data ?? []} />

      <div className="border-t pt-5">
        <PagePagination limit={limit} count={res.count} />
      </div>
    </>
  );
}
