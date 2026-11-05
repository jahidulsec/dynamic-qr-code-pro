import type { ReactNode } from "react";
import { IconActivity, IconChartLine, IconQrcode, IconTag, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScanReport } from "@/features/reports/libs/reports-analytics";
import { cn } from "@/lib/utils";

const PERIOD_LABELS: Record<ScanReport["period"], string> = {
  daily: "vs. same time yesterday",
  weekly: "vs. previous 7 days",
  monthly: "vs. previous 30 days",
  yearly: "vs. previous 12 months",
};

export function ReportsStats({ report, organizationName }: { report: ScanReport; organizationName?: string }) {
  const departmentLabel = report.department ? `Department: ${report.department}` : "All departments";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total scans in timeframe" icon={<IconChartLine />}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">{report.total.toLocaleString()}</span>
          {report.change !== null && <Change value={report.change} />}
        </div>
        <p className="text-xs text-muted-foreground">
          {report.change !== null ? PERIOD_LABELS[report.period] : "No scans in the previous period"} · {departmentLabel}
        </p>
      </StatCard>

      <StatCard label="Active dynamic QRs" icon={<IconQrcode />}>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">{report.active.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">of {report.campaigns.toLocaleString()} campaigns</span>
        </div>
        <p className="text-xs text-muted-foreground">Paused codes stop redirecting</p>
      </StatCard>

      <StatCard label="Peak scan interval" icon={<IconActivity />}>
        {report.peak ? (
          <>
            <span className="font-mono text-xl font-semibold">{report.peak.label}</span>
            <p className="text-xs text-muted-foreground">
              {report.peak.scans.toLocaleString()} scans · highest traffic in this period
            </p>
          </>
        ) : (
          <>
            <span className="font-mono text-xl font-semibold text-muted-foreground">—</span>
            <p className="text-xs text-muted-foreground">No scans in this period</p>
          </>
        )}
      </StatCard>

      <StatCard label="Selected department" icon={<IconTag />}>
        <span className="truncate font-mono text-xl font-semibold">{report.department ?? "Cross-department"}</span>
        {organizationName && <p className="truncate text-xs text-muted-foreground">{organizationName}</p>}
      </StatCard>
    </div>
  );
}

function Change({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? IconTrendingUp : IconTrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-sm font-medium tabular-nums",
        up ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {up ? "+" : "−"}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function StatCard({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card size="sm">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
        <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-2">{children}</CardContent>
    </Card>
  );
}
