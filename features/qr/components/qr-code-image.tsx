"use client";

import { ReactQRCode, type DownloadFileFormat, type FrameStyle, type ReactQRCodeRef } from "@lglab/react-qr-code";
import type { Ref } from "react";

import type { QrStyle } from "@/features/qr/schemas/qr-schema";

export const QR_DOWNLOADS: { label: string; format: DownloadFileFormat; size: number }[] = [
  { label: "PNG (1K)", format: "png", size: 1024 },
  { label: "PNG (4K)", format: "png", size: 4096 },
  { label: "SVG", format: "svg", size: 1024 },
];

export const QR_FRAME_STYLES: { value: "none" | FrameStyle; label: string }[] = [
  { value: "none", label: "No frame" },
  { value: "banner-bottom", label: "Banner bottom" },
  { value: "banner-top", label: "Banner top" },
  { value: "ticket", label: "Ticket" },
  { value: "bubble", label: "Bubble" },
  { value: "border", label: "Border" },
];

/**
 * Frame and watermark settings. These only decorate the preview and the downloaded file;
 * they are never saved, so every edit session starts with no frame.
 */
export type QrFrame = {
  style: "none" | FrameStyle;
  text: string;
  color: string;
  textColor: string;
  /** data URL of an uploaded watermark logo */
  logo: string | null;
};

export const DEFAULT_QR_FRAME: QrFrame = {
  style: "none",
  text: "SCAN ME",
  color: "#18181b",
  textColor: "#ffffff",
  logo: null,
};

// rendered size of the code; the logo is sized against it
const QR_SIZE = 128;
// with level H, up to ~30% of the code can be covered; stay well under that
const LOGO_SIZE = Math.round(QR_SIZE * 0.22);

type QrCodeImageProps = {
  ref?: Ref<ReactQRCodeRef>;
  value: string;
  style: QrStyle;
  frame?: QrFrame;
  className?: string;
};

// one renderer for the preview and exports, so a downloaded file always matches what the user saw
export function QrCodeImage({ ref, value, style, frame, className }: QrCodeImageProps) {
  return (
    <ReactQRCode
      ref={ref}
      value={value}
      size={QR_SIZE}
      // H survives smudges and print damage best; the URL is short enough to stay low-density
      level="H"
      marginSize={2}
      background={style.background}
      dataModulesSettings={{ style: style.dotStyle, color: style.foreground }}
      finderPatternOuterSettings={{ style: style.finderStyle, color: style.foreground }}
      finderPatternInnerSettings={{ style: style.finderStyle === "leaf" ? "leaf" : "square", color: style.foreground }}
      imageSettings={
        frame?.logo ? { src: frame.logo, width: LOGO_SIZE, height: LOGO_SIZE, excavate: true } : undefined
      }
      frameSettings={
        frame && frame.style !== "none"
          ? { style: frame.style, text: frame.text, color: frame.color, textColor: frame.textColor }
          : undefined
      }
      svgProps={{ className, "aria-label": `QR code for ${value}` }}
    />
  );
}
