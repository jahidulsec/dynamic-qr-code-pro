import Link from "next/link";
import { IconScan } from "@tabler/icons-react";

import { Section, SectionCardHeader, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import type { ScanReportCampaign } from "@/features/reports/libs/reports-analytics";
import { formatTags } from "@/utils/format";

type TopCampaignsProps = {
  organizationSlug: string;
  rows: ScanReportCampaign[];
  department: string | null;
};

export function TopCampaigns({ organizationSlug, rows, department }: TopCampaignsProps) {
  return (
    <Section>
      <SectionCardHeader>
        <SectionLabel>Top performing dynamic campaigns</SectionLabel>
        <SectionMeta>Filter: {department ?? "All"}</SectionMeta>
      </SectionCardHeader>

      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">No scans in this period yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-5 py-2.5 font-medium">ID &amp; campaign</th>
                <th className="px-3 py-2.5 font-medium">Tags</th>
                <th className="px-3 py-2.5 text-right font-medium">Scans</th>
                <th className="px-5 py-2.5 text-right font-medium">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="max-w-0 px-5 py-3 sm:w-full">
                    <p className="truncate font-medium">
                      <span className="font-mono text-muted-foreground"># {row.id}</span> {row.name}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground" title={row.destination}>
                      {row.destination}
                    </p>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{formatTags(row.tags)}</td>
                  <td className="px-3 py-3 text-right font-mono font-semibold tabular-nums">
                    {row.scans.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/${organizationSlug}/check?id=${row.id}`}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold whitespace-nowrap text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25"
                    >
                      <IconScan className="size-3.5" aria-hidden />
                      Check
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
