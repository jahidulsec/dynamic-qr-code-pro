import Link from "next/link";

import { Section, SectionCardHeader, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import type { ScanReportDepartment } from "@/features/reports/libs/reports-analytics";
import { cn } from "@/lib/utils";

type TagDistributionProps = {
  rows: ScanReportDepartment[];
  /** highlighted, and links back to every department */
  selected: string | null;
  /** builds the reports URL for a department; null clears it */
  hrefFor: (department: string | null) => string;
};

export function TagDistribution({ rows, selected, hrefFor }: TagDistributionProps) {
  return (
    <Section>
      <SectionCardHeader>
        <SectionLabel>Department tag distribution</SectionLabel>
        {selected ? (
          <Link href={hrefFor(null)} className="font-mono text-xs text-muted-foreground hover:text-foreground">
            Show all tags
          </Link>
        ) : (
          <SectionMeta>All tags</SectionMeta>
        )}
      </SectionCardHeader>

      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">No department tags yet.</p>
      ) : (
        <ul className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto p-4">
          {rows.map((row) => {
            const isSelected = row.name !== null && row.name === selected;
            const content = (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-mono text-sm font-medium">
                    {row.name ? `Tag: ${row.name}` : "Untagged"}
                  </span>
                  <span className="flex items-baseline gap-2 font-mono text-xs text-muted-foreground tabular-nums">
                    {row.qrCount} {row.qrCount === 1 ? "QR" : "QRs"}
                    <span className="text-sm font-semibold text-foreground">
                      {row.scans.toLocaleString()} scans ({Math.round(row.percent)}%)
                    </span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="presentation">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${row.scans ? Math.max(row.percent, 1) : 0}%` }}
                  />
                </div>
              </>
            );
            const className = cn(
              "flex flex-col gap-2 rounded-lg px-3 py-2.5 ring-1 ring-foreground/10 transition-colors",
              isSelected && "bg-primary/5 ring-primary/40",
            );

            return (
              <li key={row.name ?? "untagged"}>
                {row.name ? (
                  <Link
                    href={hrefFor(row.name)}
                    aria-current={isSelected || undefined}
                    className={cn(className, "hover:bg-muted/50")}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
