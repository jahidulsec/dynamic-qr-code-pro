"use client";

import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { IconDownload } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { exportQrCodes } from "@/features/qr/libs/qr";
import type { QrStatusFilter } from "@/features/qr/schemas/qr-schema";
import { downloadCsv } from "@/utils/csv";

export function QrExportCsvButton({ organizationSlug }: { organizationSlug: string }) {
  const searchParams = useSearchParams();
  const [isExporting, startExport] = useTransition();

  // exports what the table currently shows, across all pages
  const exportCsv = () =>
    startExport(async () => {
      const result = await exportQrCodes(organizationSlug, {
        search: searchParams.get("q") ?? undefined,
        tag: searchParams.get("department") ?? undefined,
        status: (searchParams.get("status") ?? "all") as QrStatusFilter,
      });
      if (result.success) downloadCsv(result.data.fileName, result.data.csv);
      else toast.error(result.message);
    });

  return (
    <Button variant="outline" onClick={exportCsv} disabled={isExporting}>
      <IconDownload data-icon="inline-start" />
      Export CSV
    </Button>
  );
}
