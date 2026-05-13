import FilterSection from "@/components/dashboard/FilterSection";
import QrTable from "@/components/dashboard/QrTable";
import PagePagination from "@/components/pagination/PagePagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import db from "../../../db/db";
import { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import { getAuthUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import { getQRlist } from "@/servers/lib/qr";

export const metadata: Metadata = {
  title: "Dashboard - Dynamic QR Code Pro",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { search: string; p: string; size: string };
}) {
  const user = await getAuthUser();

  if (!user) redirect("/login");

  return (
    <>
      <FilterSection user={user} />
      {/* table */}
      <Suspense fallback={<TableSkeleton />}>
        <DataTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

export type QrTableProps = Prisma.QrLinksGetPayload<{
  include: {
    admin: true;
    qr_tag: {
      select: {
        tags: {
          select: {
            name: true;
            slug: true;
          };
        };
      };
    };
  };
}>;

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
    isTrash: "no",
  });

  return (
    <>
      <QrTable count={res.count} qrLinks={res.data ?? []} limit={limit} />

      <div className="border-t pt-5">
        <PagePagination limit={limit} count={res.count} />
      </div>
    </>
  );
}
