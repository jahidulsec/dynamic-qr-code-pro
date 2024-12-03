import PagePagination from "@/components/pagination/PagePagination";
import FilterSection from "@/components/settings/FilterSection";
import Header from "@/components/settings/Header";
import { TableSkeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import db from "../../../../db/db";
import { Admin } from "@prisma/client";
import AdminTable from "@/components/settings/AdminTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Dynamic QR Code Pro",
};

export default function SettingsPage({
  searchParams,
}: {
  searchParams: { q: string; p: string };
}) {
  return (
    <>
      <Header />
      <FilterSection />
      <Suspense fallback={<TableSkeleton />}>
        <DataTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}


const DataTable = async ({
  searchParams,
}: {
  searchParams: { q: string; p: string };
}) => {
  const { q, p } = await searchParams;

  const limit = 20;
  const page = Number(p ?? 1) || 1;

  let admin: Admin[], count: number;

  try {
    [admin, count] = await Promise.all([
      db.admin.findMany({
        where: {
          name: { contains: q || undefined },
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.admin.count({
        where: {
          name: { contains: q || undefined },
        },
      }),
    ]);
  } catch (error) {
    console.log(error);
    admin = [];
    count = 0;
  }

  return (
    <>
      <AdminTable admin={admin} />

      <div className="border-t pt-5">
        <PagePagination limit={20} count={count} />
      </div>
    </>
  );
};
