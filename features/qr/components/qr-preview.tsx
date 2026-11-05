"use client";

import { ReactQRCode, type DownloadFileFormat, type ReactQRCodeRef } from "@lglab/react-qr-code";
import { useRef } from "react";
import { IconDownload } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import type { QrStyle } from "@/features/qr/schemas/qr-schema";

type QrPreviewProps = {
  value: string;
  style: QrStyle;
  label: string;
  fileName: string;
};

const DOWNLOADS: { label: string; format: DownloadFileFormat; size: number }[] = [
  { label: "PNG (1K)", format: "png", size: 1024 },
  { label: "PNG (4K)", format: "png", size: 4096 },
  { label: "SVG", format: "svg", size: 1024 },
];

export function QrPreview({ value, style, label, fileName }: QrPreviewProps) {
  const qrRef = useRef<ReactQRCodeRef>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR codes print on paper, so the tile keeps its own background in dark mode */}
      <div className="w-full max-w-64 rounded-2xl p-3 shadow-sm ring-1 ring-foreground/10" style={{ background: style.background }}>
        <ReactQRCode
          ref={qrRef}
          value={value}
          // H survives smudges and print damage best; the URL is short enough to stay low-density
          level="H"
          marginSize={2}
          background={style.background}
          dataModulesSettings={{ style: style.dotStyle, color: style.foreground }}
          finderPatternOuterSettings={{ style: style.finderStyle, color: style.foreground }}
          finderPatternInnerSettings={{ style: style.finderStyle === "leaf" ? "leaf" : "square", color: style.foreground }}
          frameSettings={
            style.frameText
              ? { style: "banner-bottom", text: style.frameText, color: style.foreground, textColor: style.background }
              : undefined
          }
          svgProps={{ className: "mx-auto aspect-auto h-auto w-full", "aria-label": `QR code for ${value}` }}
        />
      </div>
      <p className="max-w-full truncate font-mono text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {DOWNLOADS.map((download) => (
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
