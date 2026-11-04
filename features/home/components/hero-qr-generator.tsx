"use client";

import { useDeferredValue, useRef, useState } from "react";
import { ReactQRCode, type DownloadFileFormat, type ReactQRCodeRef } from "@lglab/react-qr-code";
import { IconDownload, IconLink } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_VALUE = "https://dynamicqrcodepro.com/";
const DOWNLOAD_SIZE = 1024;

export function HeroQrGenerator() {
  const [value, setValue] = useState(DEFAULT_VALUE);
  const deferredValue = useDeferredValue(value.trim() || DEFAULT_VALUE);
  const qrRef = useRef<ReactQRCodeRef>(null);

  const download = (format: DownloadFileFormat) => {
    qrRef.current?.download({ name: "qr-code", format, size: DOWNLOAD_SIZE });
  };

  return (
    <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <label htmlFor="hero-qr-input" className="mb-2 block text-sm font-medium">
        Try it — paste any link
      </label>
      <div className="relative mb-4">
        <IconLink className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="hero-qr-input"
          type="url"
          inputMode="url"
          maxLength={1000}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={DEFAULT_VALUE}
          className="h-10 rounded-full pl-9"
        />
      </div>

      {/* QR codes print dark-on-white, so the tile stays white in dark mode too */}
      <div className="rounded-2xl bg-white p-3">
        <ReactQRCode
          ref={qrRef}
          value={deferredValue}
          level="M"
          marginSize={2}
          background="#ffffff"
          dataModulesSettings={{ style: 'circle', color: "#18181b" }}
          finderPatternOuterSettings={{ style: "rounded-lg", }}
          finderPatternInnerSettings={{ style: "rounded", }}
          svgProps={{
            className: "mx-auto aspect-square h-auto w-full max-w-56",
            "aria-label": `QR code for ${deferredValue}`,
          }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button className="rounded-full" onClick={() => download("png")}>
          <IconDownload data-icon="inline-start" />
          PNG
        </Button>
        <Button variant="outline" className="rounded-full" onClick={() => download("svg")}>
          <IconDownload data-icon="inline-start" />
          SVG
        </Button>
      </div>
    </div>
  );
}
