"use client";

import React, { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectLabel,
  SelectValue,
} from "../ui/select";
import QRCodeStyling from "qr-code-styling";

export default function QRPreviewSection({
  data,
  name = "QR",
}: {
  data: string;
  name?: string;
}) {
  const [format, setFormat] = useState<any>("png");
  const [sizeQr, setSizeQr] = useState(350);
  const [option, setOption] = useState<"rounded" | "square">("square");

  const ref = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const qrCodeDownRef = useRef<QRCodeStyling | null>(null);

  // Initialize QR code only once
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: sizeQr,
      height: sizeQr,
      margin: 40,
      data: data,
      //   image:
      //     "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",

      backgroundOptions: {
        color: "#fff",
      },
    });

    qrCodeDownRef.current = new QRCodeStyling({
      width: sizeQr,
      height: sizeQr,
      margin: 40,
      data: data,
      backgroundOptions: {
        color: "#fff",
      },
    });

    if (ref.current && qrCodeRef.current) {
      qrCodeRef.current.append(ref.current);
    }
  }, []);

  const handleQrDownload = () => {
    qrCodeDownRef.current?.download({
      extension: format,
      name: name,
    });
  };

  // Update QR code size when `size` state changes
  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        dotsOptions: {
          type: option === "rounded" ? "dots" : "square",
        },
        cornersSquareOptions: {
          type: option === "rounded" ? "extra-rounded" : "square",
        },
        cornersDotOptions: {
          type: option === "rounded" ? "dot" : "square",
        },
      });
    }

    if (qrCodeDownRef.current) {
      qrCodeDownRef.current.update({
        width: sizeQr,
        height: sizeQr,
        dotsOptions: {
          type: option === "rounded" ? "dots" : "square",
        },
        cornersSquareOptions: {
          type: option === "rounded" ? "extra-rounded" : "square",
        },
        cornersDotOptions: {
          type: option === "rounded" ? "dot" : "square",
        },
      });
    }
  }, [sizeQr, option]);

  return (
    <div className="flex flex-col justify-between">
      {/* QR */}
      <div className="flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div ref={ref} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Label>Size (px)</Label>
          <Input
            value={sizeQr}
            type="number"
            onChange={(e) => setSizeQr(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label>Style</Label>
          <Select
            defaultValue="png"
            value={option}
            onValueChange={(value) => {
              setOption(value as any);
            }}
          >
            <SelectTrigger className="">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Styles</SelectLabel>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <Button className="flex-1" type="button" onClick={handleQrDownload}>
            Download
          </Button>
          <Select defaultValue="png" value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-[40px] bg-foreground text-background"></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Formats</SelectLabel>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
