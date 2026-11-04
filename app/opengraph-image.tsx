import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og can't read the oklch tokens, so the brand colors are repeated here as hex.
const colors = {
  background: "#fcfbf8",
  foreground: "#14151f",
  muted: "#5f6272",
  primary: "#4338ca",
  violet: "#a96be8",
  mint: "#4fd1a1",
  coral: "#f2765a",
  amber: "#f5c242",
};

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: colors.background,
          color: colors.foreground,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 600 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: colors.primary,
              display: "flex",
            }}
          />
          {siteConfig.shortName}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            QR codes that change when your plans do.
          </div>
          <div style={{ fontSize: 30, color: colors.muted }}>Edit destinations, track scans, brand every code.</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {[colors.violet, colors.mint, colors.coral, colors.amber].map((color) => (
            <div key={color} style={{ width: 40, height: 40, borderRadius: 10, background: color }} />
          ))}
        </div>
      </div>
    ),
    size
  );
}
