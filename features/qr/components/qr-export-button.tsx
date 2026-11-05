"use client";

import type { ReactQRCodeRef } from "@lglab/react-qr-code";
import { useRef, useState } from "react";
import { IconDownload } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { QR_DOWNLOADS, QrCodeImage } from "@/features/qr/components/qr-code-image";
import type { QrStyle } from "@/features/qr/schemas/qr-schema";

type QrExportButtonProps = {
  value: string;
  style: QrStyle;
  fileName: string;
  label: string;
};

export function QrExportButton({ value, style, fileName, label }: QrExportButtonProps) {
  const qrRef = useRef<ReactQRCodeRef>(null);
  // the QR is only rendered once the menu is opened, so a full table doesn't build an SVG per row up front
  const [isReady, setIsReady] = useState(false);

  return (
    <>
      <DropdownMenu onOpenChange={(open) => open && setIsReady(true)}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Export QR for ${label}`} />}>
          <IconDownload />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          {QR_DOWNLOADS.map((download) => (
            <DropdownMenuItem
              key={download.label}
              onClick={() => qrRef.current?.download({ name: fileName, format: download.format, size: download.size })}
            >
              {download.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isReady && (
        <div aria-hidden className="pointer-events-none fixed -left-[9999px] size-64">
          <QrCodeImage ref={qrRef} value={value} style={style} />
        </div>
      )}
    </>
  );
}
