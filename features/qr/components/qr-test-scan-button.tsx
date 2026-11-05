"use client";

import type { ComponentProps } from "react";
import { IconCircleCheck, IconClockX, IconPlayerPause, IconScan } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

export type QrCheckState = "ready" | "paused" | "expired";

export const QR_CHECK_STATUS = {
  ready: {
    label: "Ready",
    icon: IconCircleCheck,
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  paused: {
    label: "Paused",
    icon: IconPlayerPause,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  expired: { label: "Expired", icon: IconClockX, className: "bg-destructive/10 text-destructive" },
} satisfies Record<QrCheckState, { label: string; icon: typeof IconCircleCheck; className: string }>;

type QrTestScanButtonProps = Omit<ComponentProps<typeof Button>, "render" | "nativeButton" | "onClick" | "children"> & {
  /** the encoded short link */
  qrValue: string;
  state: QrCheckState;
  /** called when a scan that will be counted is started */
  onScan: () => void;
  readyLabel?: string;
};

/**
 * Opens the real short link, so the test runs the same redirect and scan logging a phone would.
 * Only ready codes record scans, so only they call `onScan`.
 */
export function QrTestScanButton({
  qrValue,
  state,
  onScan,
  readyLabel = "Click to Test Scan (+1 Count)",
  ...props
}: QrTestScanButtonProps) {
  const ready = state === "ready";

  return (
    <Button
      {...props}
      render={<a href={qrValue} target="_blank" rel="noopener noreferrer" />}
      nativeButton={false}
      onClick={() => ready && onScan()}
    >
      <IconScan data-icon="inline-start" />
      {ready ? readyLabel : `Test Scan (${QR_CHECK_STATUS[state].label}, not counted)`}
    </Button>
  );
}
