"use client";

import { useState } from "react";
import { IconAccessPoint, IconScan, IconShieldCheck } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { QrCodeImage } from "@/features/qr/components/qr-code-image";
import { QR_CHECK_STATUS, QrTestScanButton, type QrCheckState } from "@/features/qr/components/qr-test-scan-button";
import type { QrStyle } from "@/features/qr/schemas/qr-schema";

type QrCheckDialogProps = {
  qr: {
    id: number;
    name: string;
    destination: string;
    tag: string | null;
    createdBy: string;
    scanCount: number;
  };
  state: QrCheckState;
  /** formatted on the server so it matches the table and never mismatches on hydration */
  createdLabel: string;
  /** the encoded short link and its printed label */
  qrValue: string;
  qrLabel: string;
  qrStyle: QrStyle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditUrl: () => void;
};

export function QrCheckDialog({
  qr,
  state,
  createdLabel,
  qrValue,
  qrLabel,
  qrStyle,
  open,
  onOpenChange,
  onEditUrl,
}: QrCheckDialogProps) {
  // bumped optimistically: the real scan is recorded by the short link after the redirect is sent
  const [scans, setScans] = useState(qr.scanCount);
  const status = QR_CHECK_STATUS[state];
  const ready = state === "ready";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <div className="flex items-center gap-3 border-b p-6 pr-14">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            <IconScan className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-base font-semibold">Click to Check · Dynamic QR Simulator</DialogTitle>
            <DialogDescription className="text-xs">
              Test scannability, dynamic redirect routing, and real-time counter increment
            </DialogDescription>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <section className="flex flex-col items-center gap-4 rounded-xl p-5 ring-1 ring-foreground/10">
            <div className="relative w-full max-w-56 p-1.5">
              {/* viewfinder corners */}
              <span aria-hidden className="absolute top-0 left-0 size-5 rounded-tl-md border-t-2 border-l-2 border-foreground" />
              <span aria-hidden className="absolute top-0 right-0 size-5 rounded-tr-md border-t-2 border-r-2 border-foreground" />
              <span aria-hidden className="absolute bottom-0 left-0 size-5 rounded-bl-md border-b-2 border-l-2 border-foreground" />
              <span aria-hidden className="absolute right-0 bottom-0 size-5 rounded-br-md border-r-2 border-b-2 border-foreground" />
              {/* QR codes print on paper, so the tile keeps its own background in dark mode */}
              <div className="rounded-lg p-2 ring-1 ring-foreground/5" style={{ background: qrStyle.background }}>
                <QrCodeImage value={qrValue} style={qrStyle} className="mx-auto aspect-auto h-auto w-full" />
              </div>
            </div>

            <div className="flex max-w-full flex-col items-center gap-1 text-center">
              <span className="font-mono text-sm font-medium"># {qr.id}</span>
              <span className="max-w-full truncate text-sm text-muted-foreground" title={qr.name}>
                {qr.name}
              </span>
            </div>

            <QrTestScanButton
              className="w-full"
              qrValue={qrValue}
              state={state}
              onScan={() => setScans((count) => count + 1)}
            />
          </section>

          <div className="flex flex-col justify-between gap-4">
            <section className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-foreground/10">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Dynamic Routing Status</h3>
                <Badge className={status.className}>
                  <status.icon data-icon="inline-start" />
                  {status.label}
                </Badge>
              </div>

              <Field label="Scanned Short Code">
                <span className="truncate">{qrLabel}</span>
                <IconAccessPoint
                  className={ready ? "size-4 shrink-0 text-emerald-600 dark:text-emerald-400" : "size-4 shrink-0 text-muted-foreground"}
                />
              </Field>

              <Field
                label="Target Embedded URL"
                action={
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={onEditUrl}
                  >
                    Edit URL
                  </button>
                }
              >
                <span className="truncate" title={qr.destination}>
                  {qr.destination}
                </span>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 p-3 ring-1 ring-foreground/10">
                  <div className="text-xs text-muted-foreground">Total Scans</div>
                  <div className="mt-0.5 font-mono text-xl font-semibold tabular-nums" aria-live="polite">
                    {scans.toLocaleString()}
                  </div>
                </div>
                <div className="min-w-0 rounded-lg bg-muted/40 p-3 ring-1 ring-foreground/10">
                  <div className="text-xs text-muted-foreground">Created By</div>
                  <div className="mt-1 truncate text-sm font-semibold" title={qr.createdBy}>
                    {qr.createdBy}
                  </div>
                </div>
              </div>
            </section>

            <p className="flex gap-2 text-xs text-muted-foreground">
              <IconShieldCheck className="size-4 shrink-0" />
              Real-time dynamic redirection. Change target anytime without reprinting.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t p-4 px-6">
          <p className="text-xs text-muted-foreground">
            {qr.tag && (
              <>
                Tagged under <span className="font-semibold text-foreground">{qr.tag}</span> ·{" "}
              </>
            )}
            Created {createdLabel}
          </p>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {action}
      </div>
      <div className="flex h-9 items-center justify-between gap-2 rounded-md border bg-background px-3 font-mono text-sm">
        {children}
      </div>
    </div>
  );
}
