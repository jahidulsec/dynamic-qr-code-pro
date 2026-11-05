"use client";

import { ReactQRCode, type DownloadFileFormat, type ReactQRCodeRef } from "@lglab/react-qr-code";
import type { Ref } from "react";

import type { QrStyle } from "@/features/qr/schemas/qr-schema";

export const QR_DOWNLOADS: { label: string; format: DownloadFileFormat; size: number }[] = [
  { label: "PNG (1K)", format: "png", size: 1024 },
  { label: "PNG (4K)", format: "png", size: 4096 },
  { label: "SVG", format: "svg", size: 1024 },
];

type QrCodeImageProps = {
  ref?: Ref<ReactQRCodeRef>;
  value: string;
  style: QrStyle;
  className?: string;
};

// one renderer for the preview and exports, so a downloaded file always matches what the user saw
export function QrCodeImage({ ref, value, style, className }: QrCodeImageProps) {
  return (
    <ReactQRCode
      ref={ref}
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
      svgProps={{ className, "aria-label": `QR code for ${value}` }}
    />
  );
}
