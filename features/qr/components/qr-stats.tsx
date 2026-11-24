import { IconChartBar, IconQrcode, IconScan, IconTrophy } from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrAnalyticsButton } from "@/features/qr/components/qr-analytics-button";
import { qrTagNames, type QrStatsData } from "@/features/qr/libs/qr-query";

type QrStatsProps = {
  stats: QrStatsData;
  organizationSlug: string;
};

export function QrStats({ stats, organizationSlug }: QrStatsProps) {
  const limit = stats.plan.qrLimit;
  const used = limit ? Math.min(100, (stats.total / limit) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="QR codes" icon={<IconQrcode />}>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">{stats.total}</span>
          <span className="font-mono text-sm text-muted-foreground">{limit === null ? "Unlimited" : `/ ${limit} quota`}</span>
        </div>
        {limit !== null && (
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="presentation">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(used, stats.total ? 1 : 0)}%` }} />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {stats.active} active · {stats.total - stats.active} paused
        </p>
      </StatCard>

      <StatCard label="Total scans" icon={<IconScan />}>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">{stats.scans.toLocaleString()}</span>
          {stats.scansToday > 0 && (
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">+{stats.scansToday} today</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Across all QR codes outside the trash</p>
      </StatCard>

      <StatCard label="Top campaign" icon={<IconTrophy />}>
        {stats.top ? (
          <>
            <QrAnalyticsButton
              organizationSlug={organizationSlug}
              qr={{ id: stats.top.id, name: stats.top.name, tags: qrTagNames(stats.top) }}
              variant="link"
              className="h-auto justify-start p-0 text-left whitespace-normal text-foreground"
            >
              <span className="line-clamp-2">{stats.top.name}</span>
            </QrAnalyticsButton>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono">{stats.top.scanCount.toLocaleString()} scans</span>
              {stats.top.tags.length > 0 && ` · ${stats.top.tags.length > 1 ? "Tags" : "Tag"} ${qrTagNames(stats.top).join(", ")}`}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No scans yet</p>
        )}
      </StatCard>

      <StatCard label="Plan" icon={<IconChartBar />}>
        <span className="text-xl font-semibold">{stats.plan.name}</span>
        <p className="text-xs text-muted-foreground">
          {limit === null
            ? "Unlimited QR codes"
            : `${limit} QR codes · ${Math.max(0, limit - stats.total)} remaining`}
        </p>
      </StatCard>
    </div>
  );
}

function StatCard({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card size="sm">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
        <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      </CardHeader>
      <CardContent className="gap-2">{children}</CardContent>
    </Card>
  );
}
