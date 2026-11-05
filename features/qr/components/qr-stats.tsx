import Link from "next/link";
import { IconChartBar, IconQrcode, IconScan, IconTrophy } from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QR_QUOTA } from "@/features/qr/constants";
import type { QrStatsData } from "@/features/qr/libs/qr-query";

type QrStatsProps = {
  stats: QrStatsData;
  statsHref: (id: number) => string;
};

export function QrStats({ stats, statsHref }: QrStatsProps) {
  const used = Math.min(100, (stats.total / QR_QUOTA) * 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="QR codes" icon={<IconQrcode />}>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">{stats.total}</span>
          <span className="font-mono text-sm text-muted-foreground">/ {QR_QUOTA} quota</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="presentation">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(used, stats.total ? 1 : 0)}%` }} />
        </div>
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
            <Link href={statsHref(stats.top.id)} scroll={false} className="line-clamp-2 font-medium hover:underline">
              {stats.top.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono">{stats.top.scanCount.toLocaleString()} scans</span>
              {stats.top.tag && ` · Tag ${stats.top.tag.name}`}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No scans yet</p>
        )}
      </StatCard>

      <StatCard label="Plan" icon={<IconChartBar />}>
        <span className="text-xl font-semibold">{QR_QUOTA} QR codes</span>
        <p className="text-xs text-muted-foreground">{Math.max(0, QR_QUOTA - stats.total)} remaining</p>
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
