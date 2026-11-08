"use client";

import { useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { useAccess } from "@/features/organizations";
import { QrAnalyticsDialog, type QrAnalyticsResult } from "@/features/qr/components/qr-analytics-dialog";
import { getQrAnalytics } from "@/features/qr/libs/qr";

type QrAnalyticsButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  organizationSlug: string;
  qr: { id: number; name: string; tags: string[] };
};

export function QrAnalyticsButton({ organizationSlug, qr, ...props }: QrAnalyticsButtonProps) {
  const canRead = useAccess().can({ report: ["read"] });
  const [open, setOpen] = useState(false);
  // a fresh request per opening, so the numbers are never stale
  const [analytics, setAnalytics] = useState<Promise<QrAnalyticsResult> | null>(null);

  const openDialog = () => {
    setAnalytics(getQrAnalytics(organizationSlug, qr.id));
    setOpen(true);
  };

  // without report access the label (e.g. a scan count) still shows, just not as a button
  if (!canRead) return <span className="font-mono tabular-nums">{props.children}</span>;

  return (
    <>
      <Button {...props} onClick={openDialog} />

      {analytics && (
        <QrAnalyticsDialog
          organizationSlug={organizationSlug}
          qr={qr}
          analytics={analytics}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
