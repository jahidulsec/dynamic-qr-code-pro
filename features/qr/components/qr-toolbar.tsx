"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { IconDownload, IconFilter, IconPlus, IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportQrCodes } from "@/features/qr/libs/qr";
import { QR_STATUS_FILTERS, type QrStatusFilter } from "@/features/qr/schemas/qr-schema";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/utils/csv";

const ALL_TAGS = "__all";
const SEARCH_DELAY_MS = 300;

export function QrToolbar({ organizationSlug, tags }: { organizationSlug: string; tags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExport] = useTransition();

  const status = (searchParams.get("status") ?? "all") as QrStatusFilter;
  const tag = searchParams.get("department") ?? ALL_TAGS;
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

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

  useEffect(() => {
    if (search === (searchParams.get("q") ?? "")) return;
    const timer = setTimeout(() => navigate({ q: search.trim() || null }), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // only the typed text should restart the debounce
  }, [search]);

  // exports what the table currently shows, across all pages
  const exportCsv = () =>
    startExport(async () => {
      const result = await exportQrCodes(organizationSlug, {
        search: searchParams.get("q") ?? undefined,
        tag: searchParams.get("department") ?? undefined,
        status,
      });
      if (result.success) downloadCsv(result.data.fileName, result.data.csv);
      else toast.error(result.message);
    });

  const tagItems = [{ value: ALL_TAGS, label: "All tags" }, ...tags.map((name) => ({ value: name, label: name }))];
  const createHref = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("new", "1");
    return `${pathname}?${params}`;
  })();

  return (
    <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center" aria-busy={isPending}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:w-72">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ID, name, URL, author…"
            aria-label="Search QR codes"
            className="pl-9"
          />
        </div>

        <Select
          items={tagItems}
          value={tag}
          onValueChange={(value) => navigate({ department: value && value !== ALL_TAGS ? String(value) : null })}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by tag">
            <IconFilter className="text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tagItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
        <Button variant="outline" onClick={exportCsv} disabled={isExporting}>
          <IconDownload data-icon="inline-start" />
          Export CSV
        </Button>
        <Button render={<Link href={createHref} scroll={false} />} nativeButton={false}>
          <IconPlus data-icon="inline-start" />
          Generate QR
        </Button>
      </div>
    </div>
  );
}
