"use client";

import type { ReactQRCodeRef } from "@lglab/react-qr-code";
import { useRef } from "react";
import { IconDownload } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { QR_DOWNLOADS, QrCodeImage } from "@/features/qr/components/qr-code-image";
import type { QrStyle } from "@/features/qr/schemas/qr-schema";

type QrPreviewProps = {
  value: string;
  style: QrStyle;
  label: string;
  fileName: string;
};

export function QrPreview({ value, style, label, fileName }: QrPreviewProps) {
  const qrRef = useRef<ReactQRCodeRef>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR codes print on paper, so the tile keeps its own background in dark mode */}
      <div className="w-full max-w-64 rounded-2xl p-3 shadow-sm ring-1 ring-foreground/10" style={{ background: style.background }}>
        <QrCodeImage ref={qrRef} value={value} style={style} className="mx-auto aspect-auto h-auto w-full" />
      </div>
      <p className="max-w-full truncate font-mono text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {QR_DOWNLOADS.map((download) => (
          <Button
            key={download.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => qrRef.current?.download({ name: fileName, format: download.format, size: download.size })}
          >
            <IconDownload data-icon="inline-start" />
            {download.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
