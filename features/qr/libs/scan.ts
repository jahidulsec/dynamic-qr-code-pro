import { createHash } from "node:crypto";

import { recordQrScan } from "@/features/qr/services/qr-scan";
import { env } from "@/lib/env";

// link previews and crawlers follow short links too; they aren't scans
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|curl|wget|python-requests|headless/i;

export const isBot = (userAgent: string) => !userAgent || BOT_PATTERN.test(userAgent);

export function detectDevice(userAgent: string) {
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/windows|macintosh|linux|cros/i.test(userAgent)) return "desktop";
  return "other";
}

const header = (headers: Headers, name: string) => {
  const value = headers.get(name)?.trim();
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// location comes from the CDN in front of the app (Cloudflare or Vercel); without one it stays unknown
export function detectLocation(headers: Headers) {
  const country = (header(headers, "cf-ipcountry") ?? header(headers, "x-vercel-ip-country"))?.toUpperCase();
  const region = header(headers, "x-vercel-ip-city") ?? header(headers, "cf-region") ?? header(headers, "cf-ipcity");

  return {
    // XX and T1 are Cloudflare's "unknown" and "Tor"
    country: country && /^[A-Z]{2}$/.test(country) && country !== "XX" && country !== "T1" ? country : null,
    region: region ? region.slice(0, 64) : null,
  };
}

export function clientIp(headers: Headers) {
  return (
    header(headers, "cf-connecting-ip") ??
    header(headers, "x-real-ip") ??
    header(headers, "x-forwarded-for")?.split(",")[0]?.trim() ??
    ""
  );
}

// one visitor per day per device; the IP itself is never stored
export function visitorHash(ip: string, userAgent: string, date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}|${userAgent}|${day}|${env.SESSION_SECRET}`).digest("hex");
}

export async function recordScan(qrCodeId: number, headers: Headers) {
  const userAgent = headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return;

  await recordQrScan({
    qrCodeId,
    visitorHash: visitorHash(clientIp(headers), userAgent),
    device: detectDevice(userAgent),
    ...detectLocation(headers),
  });
}
