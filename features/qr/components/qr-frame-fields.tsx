"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { IconPhotoUp, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { QR_FRAME_STYLES, type QrFrame } from "@/features/qr/components/qr-code-image";
import { cn } from "@/lib/utils";

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const LOGO_MAX_BYTES = 1024 * 1024;

type QrFrameFieldsProps = {
  frame: QrFrame;
  onChange: (frame: QrFrame) => void;
};

// frame and watermark only shape the preview and downloads; nothing here is submitted with the form
export function QrFrameFields({ frame, onChange }: QrFrameFieldsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<QrFrame>) => onChange({ ...frame, ...patch });
  const hasFrame = frame.style !== "none";

  const onLogoChange = (file: File | undefined) => {
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      toast.error("Use a PNG, JPG, WebP or SVG image");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      toast.error("Logo must be at most 1 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && set({ logo: reader.result });
    reader.onerror = () => toast.error("Couldn't read that file");
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    set({ logo: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <Field>
        <FieldLabel>Frame</FieldLabel>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {QR_FRAME_STYLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={frame.style === value}
              onClick={() => set({ style: value })}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs transition-colors",
                frame.style === value ? "border-primary bg-primary/5 text-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <FrameThumb style={value} />
              {label}
            </button>
          ))}
        </div>
      </Field>

      {hasFrame && (
        <>
          <Field>
            <FieldLabel htmlFor="frame-text">Frame text</FieldLabel>
            <Input
              id="frame-text"
              value={frame.text}
              maxLength={24}
              placeholder="SCAN ME"
              onChange={(event) => set({ text: event.target.value })}
            />
            <FieldDescription>Leave empty for a frame without a label.</FieldDescription>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <FrameColor label="Frame colour" value={frame.color} onChange={(color) => set({ color })} />
            <FrameColor label="Text colour" value={frame.textColor} onChange={(textColor) => set({ textColor })} />
          </div>
        </>
      )}

      <Field>
        <FieldLabel htmlFor="watermark-logo">Watermark logo</FieldLabel>
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
            {frame.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
              <img src={frame.logo} alt="Watermark logo" className="size-full object-contain" />
            ) : (
              <IconPhotoUp className="size-5 text-muted-foreground" />
            )}
          </div>
          <input
            ref={fileRef}
            id="watermark-logo"
            type="file"
            accept={LOGO_TYPES.join(",")}
            className="sr-only"
            onChange={(event) => onLogoChange(event.target.files?.[0])}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {frame.logo ? "Replace" : "Upload logo"}
          </Button>
          {frame.logo && (
            <Button type="button" variant="ghost" size="sm" onClick={clearLogo}>
              <IconX data-icon="inline-start" />
              Remove
            </Button>
          )}
        </div>
        <FieldDescription>PNG, JPG, WebP or SVG up to 1 MB, placed in the centre of the code.</FieldDescription>
      </Field>

      <FieldDescription>
        Frame and logo are applied to the preview and downloads only; they aren&apos;t saved with the code.
      </FieldDescription>
    </>
  );
}

function FrameColor({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = `frame-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          id={id}
          defaultValue={value}
          key={value}
          className="font-mono"
          maxLength={7}
          onBlur={(event) => /^#[0-9a-fA-F]{6}$/.test(event.target.value) && onChange(event.target.value)}
        />
      </div>
    </Field>
  );
}

// small schematic of each frame style so the picker reads at a glance
function FrameThumb({ style }: { style: QrFrame["style"] }) {
  const code = <rect x="7" y="7" width="10" height="10" rx="1" className="fill-current opacity-40" />;
  return (
    <svg viewBox="0 0 24 28" className="h-7 w-6" aria-hidden>
      {style === "none" && (
        <>
          <rect x="4" y="6" width="16" height="16" rx="2" className="fill-none stroke-current" strokeDasharray="2 2" />
          <rect x="7" y="9" width="10" height="10" rx="1" className="fill-current opacity-40" />
        </>
      )}
      {style === "banner-bottom" && (
        <g>
          <rect x="3" y="3" width="18" height="22" rx="2" className="fill-current" />
          <rect x="5" y="5" width="14" height="14" rx="1" className="fill-background" />
          <g transform="translate(0 0)">{code}</g>
        </g>
      )}
      {style === "banner-top" && (
        <g>
          <rect x="3" y="3" width="18" height="22" rx="2" className="fill-current" />
          <rect x="5" y="9" width="14" height="14" rx="1" className="fill-background" />
          <g transform="translate(0 4)">{code}</g>
        </g>
      )}
      {style === "ticket" && (
        <g>
          <rect x="3" y="3" width="18" height="22" rx="2" className="fill-none stroke-current" strokeWidth="1.5" />
          <line x1="3" y1="20" x2="21" y2="20" className="stroke-current" strokeDasharray="1.5 1.5" />
          <g transform="translate(0 -1)">{code}</g>
        </g>
      )}
      {style === "bubble" && (
        <g>
          <rect x="3" y="3" width="18" height="18" rx="3" className="fill-current" />
          <path d="M10 21 L12 25 L14 21 Z" className="fill-current" />
          <rect x="5" y="5" width="14" height="14" rx="1" className="fill-background" />
          {code}
        </g>
      )}
      {style === "border" && (
        <g>
          <rect x="3" y="3" width="18" height="22" rx="2" className="fill-none stroke-current" strokeWidth="1.5" />
          {code}
        </g>
      )}
    </svg>
  );
}
