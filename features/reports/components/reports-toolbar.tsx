"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { IconDownload } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { QrTagCombobox } from "@/features/qr-tags";
import { exportScanReport } from "@/features/reports/libs/reports";
import { REPORT_PERIODS, type ReportPeriod } from "@/features/reports/schemas/reports-schema";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/utils/csv";

type ReportsToolbarProps = {
  organizationSlug: string;
  period: ReportPeriod;
  department: string | null;
};

export function ReportsToolbar({ organizationSlug, period, department }: ReportsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExport] = useTransition();

  const navigate = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  // exports exactly what the page shows
  const exportCsv = () =>
    startExport(async () => {
      const result = await exportScanReport(organizationSlug, { period, department: department ?? undefined });
      if (result.success) downloadCsv(result.data.fileName, result.data.csv);
      else toast.error(result.message);
    });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end" aria-busy={isPending}>
      <QrTagCombobox
        organizationSlug={organizationSlug}
        value={department ?? ""}
        onValueChange={(value) => navigate({ department: value || null })}
        placeholder="All departments"
        aria-label="Filter by department"
        showClear
        className="sm:w-52"
      />

      <div role="group" aria-label="Report period" className="inline-flex w-fit rounded-lg bg-muted p-[3px]">
        {REPORT_PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={period === value}
            onClick={() => navigate({ period: value === "weekly" ? null : value })}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium capitalize text-muted-foreground transition-colors hover:text-foreground",
              period === value && "bg-background text-foreground shadow-sm",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <Button variant="outline" onClick={exportCsv} disabled={isExporting} className="w-fit">
        <IconDownload data-icon="inline-start" />
        Export CSV
      </Button>
    </div>
  );
}
