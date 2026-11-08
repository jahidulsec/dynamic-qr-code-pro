"use client";

import { useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { QrAnalyticsDialog, type QrAnalyticsResult } from "@/features/qr/components/qr-analytics-dialog";
import { getQrAnalytics } from "@/features/qr/libs/qr";

type QrAnalyticsButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  organizationSlug: string;
  qr: { id: number; name: string; tags: string[] };
};

export function QrAnalyticsButton({ organizationSlug, qr, ...props }: QrAnalyticsButtonProps) {
  const [open, setOpen] = useState(false);
  // a fresh request per opening, so the numbers are never stale
  const [analytics, setAnalytics] = useState<Promise<QrAnalyticsResult> | null>(null);

  const openDialog = () => {
    setAnalytics(getQrAnalytics(organizationSlug, qr.id));
    setOpen(true);
  };

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
