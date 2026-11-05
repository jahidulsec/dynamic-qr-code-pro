"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { IconDeviceMobile, IconDownload, IconWorld } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { exportQrScans } from "@/features/qr/libs/qr";
import type { QrAnalytics, Share } from "@/features/qr/libs/qr-analytics";
import { downloadCsv } from "@/utils/csv";

type QrAnalyticsDialogProps = {
  organizationSlug: string;
  qr: { id: number; name: string; tag: string | null };
  analytics: QrAnalytics;
  closeHref: string;
};

export function QrAnalyticsDialog({ organizationSlug, qr, analytics, closeHref }: QrAnalyticsDialogProps) {
  const router = useRouter();
  const [isExporting, startExport] = useTransition();
  const close = () => router.push(closeHref, { scroll: false });
  const exportCsv = () =>
    startExport(async () => {
      const result = await exportQrScans(organizationSlug, qr.id);
      if (result.success) downloadCsv(result.data.fileName, result.data.csv);
      else toast.error(result.message);
    });

  const peak = Math.max(1, ...analytics.daily.map((day) => day.scans));

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        <div className="flex flex-col gap-1.5 border-b p-6 pr-14">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            # {qr.id}
            {qr.tag && <Badge variant="secondary">Tag: {qr.tag}</Badge>}
          </div>
          <DialogTitle className="text-lg">{qr.name}</DialogTitle>
          <DialogDescription className="sr-only">Scan analytics for this QR code</DialogDescription>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Total scans" value={analytics.total} />
            <Stat label="Unique visitors" value={analytics.uniqueVisitors} hint="Counted per device per day" />
          </div>

          <section className="rounded-xl p-4 ring-1 ring-foreground/10">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium">Scan activity (last {analytics.daily.length} days)</h3>
              <span className="font-mono text-xs text-muted-foreground">302 redirects</span>
            </div>
            <div className="flex h-36 items-end gap-2">
              {analytics.daily.map((day) => (
                <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{day.scans}</span>
                  <div
                    className="w-full rounded-t-md bg-primary"
                    style={{ height: `${Math.max(3, (day.scans / peak) * 100)}%`, opacity: day.scans ? 1 : 0.25 }}
                    title={`${day.date}: ${day.scans} scans`}
                  />
                  <span className="text-xs text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Breakdown
              icon={<IconWorld className="size-4" />}
              title="Location"
              rows={analytics.regions}
              empty={
                analytics.total
                  ? "No location data yet. It needs Cloudflare or Vercel in front of the app."
                  : "No scans yet."
              }
              footnote={
                analytics.regions.length && analytics.unknownLocation
                  ? `${analytics.unknownLocation} scans had no location.`
                  : undefined
              }
            />
            <Breakdown
              icon={<IconDeviceMobile className="size-4" />}
              title="Device"
              rows={analytics.devices}
              empty="No scans yet."
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t p-4 px-6">
          <Button variant="ghost" size="sm" onClick={exportCsv} disabled={isExporting}>
            <IconDownload data-icon="inline-start" />
            Export scans CSV
          </Button>
          <Button onClick={close}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-4 ring-1 ring-foreground/10">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Breakdown({
  icon,
  title,
  rows,
  empty,
  footnote,
}: {
  icon: React.ReactNode;
  title: string;
  rows: Share[];
  empty: string;
  footnote?: string;
}) {
  return (
    <section className="rounded-xl p-4 ring-1 ring-foreground/10">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </h3>
      {rows.length ? (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-2 text-sm">
                <span className="truncate">{row.label}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{row.percent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${row.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
      {footnote && <p className="mt-3 text-xs text-muted-foreground">{footnote}</p>}
    </section>
  );
}
