"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { SearchInput } from "@/components/shared/input/search";
import { Select } from "@/components/shared/select/select";
import { ADMIN_EXPIRING_DAYS, ADMIN_ORGANIZATION_TABS } from "@/features/admin/constants";
import type { AdminOrganizationTab } from "@/features/admin/schemas/admin-query-schema";
import { cn } from "@/lib/utils";

const TAB_LABELS = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
  rejected: "Rejected",
  all: "All",
} as const satisfies Record<AdminOrganizationTab, string>;

type AdminOrganizationFiltersProps = {
  /** the tab being shown, which may be the default rather than one in the URL */
  status: AdminOrganizationTab;
  counts: Record<AdminOrganizationTab, number>;
  plans: { key: string; name: string }[];
};

/**
 * Everything lives in the URL. Tabs and the expiring toggle are links, so each change is a history
 * entry the back button returns to; search and plan replace the current entry, like the QR list.
 */
export function AdminOrganizationFilters({ status, counts, plans }: AdminOrganizationFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const expiring = searchParams.get("expiring") === String(ADMIN_EXPIRING_DAYS);

  // any filter change starts again from the first page
  const hrefWith = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* always written to the URL, so a reload keeps the tab even once the pending queue empties */}
      <nav aria-label="Filter by status" className="-mx-1 overflow-x-auto px-1">
        <div className="inline-flex w-max rounded-lg bg-muted p-[3px]">
          {ADMIN_ORGANIZATION_TABS.map((tab) => (
            <Link
              key={tab}
              href={hrefWith({ status: tab })}
              scroll={false}
              aria-current={status === tab ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                status === tab && "bg-background text-foreground shadow-sm",
              )}
            >
              {TAB_LABELS[tab]}
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{counts[tab].toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput containerClassName="sm:w-72" placeholder="Search by name or slug…" aria-label="Search organizations" />

        <Select
          paramKey="plan"
          data={plans.map((plan) => ({ label: plan.name, value: plan.key }))}
          placeholder="All plans"
          aria-label="Filter by plan"
          className="sm:w-48"
        />

        <Link
          href={hrefWith({ expiring: expiring ? null : String(ADMIN_EXPIRING_DAYS) })}
          scroll={false}
          aria-pressed={expiring}
          role="button"
          className={cn(
            "inline-flex h-9 w-fit items-center rounded-lg border px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
            expiring && "border-primary bg-primary/10 text-foreground",
          )}
        >
          Expiring within {ADMIN_EXPIRING_DAYS} days
        </Link>
      </div>
    </div>
  );
}
