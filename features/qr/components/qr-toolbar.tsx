"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { SearchInput } from "@/components/shared/input/search";
import { QrCreateButton } from "@/features/qr/components/qr-create-button";
import { QrExportCsvButton } from "@/features/qr/components/qr-export-csv-button";
import { QR_STATUS_FILTERS, type QrStatusFilter } from "@/features/qr/schemas/qr-schema";
import { QrTagCombobox } from "@/features/qr-tags";
import { cn } from "@/lib/utils";

type QrToolbarProps = {
  organizationSlug: string;
  baseUrl: string;
  tags: string[];
};

export function QrToolbar({ organizationSlug, baseUrl, tags }: QrToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const status = (searchParams.get("status") ?? "all") as QrStatusFilter;
  // "" means every tag
  const tag = searchParams.get("department") ?? "";

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

  const navigate = (changes: Record<string, string | null>) =>
    startTransition(() => router.replace(hrefWith(changes), { scroll: false }));

  return (
    <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center" aria-busy={isPending}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          containerClassName="sm:w-72"
          placeholder="Search by ID, name, URL, author…"
          aria-label="Search QR codes"
        />

        <QrTagCombobox
          organizationSlug={organizationSlug}
          value={tag}
          onValueChange={(value) => navigate({ department: value || null })}
          placeholder="All tags"
          aria-label="Filter by tag"
          showClear
          className="sm:w-44"
        />

        <div role="group" aria-label="Filter by status" className="inline-flex w-fit rounded-lg bg-muted p-[3px]">
          {QR_STATUS_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => navigate({ status: value === "all" ? null : value })}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium capitalize text-muted-foreground transition-colors hover:text-foreground",
                status === value && "bg-background text-foreground shadow-sm",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <QrExportCsvButton organizationSlug={organizationSlug} />
        <QrCreateButton organizationSlug={organizationSlug} baseUrl={baseUrl} tags={tags} />
      </div>
    </div>
  );
}
