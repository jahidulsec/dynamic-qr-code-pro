import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchInput } from "@/components/shared/input/search";
import PagePagination from "@/components/shared/pagination/pagination";
import { Section, SectionContainer } from "@/components/shared/section/section";
import { TableSkeleton } from "@/components/shared/skeleton/table";
import { ADMIN_PAGE_TITLES, AdminPageHeader, AdminUserTable, getAdminUsers } from "@/features/admin";
import type { SearchParams } from "@/types/params";

export const metadata: Metadata = { title: ADMIN_PAGE_TITLES.users };

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <>
      <AdminPageHeader title={ADMIN_PAGE_TITLES.users} />
      <SectionContainer className="pt-4 md:pt-6">
        <Section className="overflow-hidden">
          <div className="p-4">
            <SearchInput containerClassName="sm:w-72" placeholder="Search by name or email…" aria-label="Search users" />
          </div>
          <Suspense fallback={<TableSkeleton />}>
            <UsersSection searchParams={searchParams} />
          </Suspense>
        </Section>
      </SectionContainer>
    </>
  );
}

async function UsersSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const list = await getAdminUsers(await searchParams);

  if (!list.success) return <p className="border-t p-5 text-sm text-muted-foreground">{list.message}</p>;

  const { items, count, query } = list.data;

  return (
    <>
      <AdminUserTable items={items} emptyMessage={query.search ? "No users match this search." : "No users yet."} />
      {count > 0 && (
        <div className="border-t px-4 py-3">
          <PagePagination count={count} limit={query.size} />
        </div>
      )}
    </>
  );
}
