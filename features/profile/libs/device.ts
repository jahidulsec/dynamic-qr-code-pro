// rough device labels, enough to tell sessions apart without a UA parsing dependency
const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\/|FxiOS/, "Firefox"],
  [/Chrome\/|CriOS/, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
  [/Android/, "Android"],
  [/iPad/, "iPadOS"],
  [/iPhone|iPod/, "iOS"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

export type DeviceKind = "desktop" | "mobile" | "tablet";

const match = (value: string, patterns: [RegExp, string][]) => patterns.find(([pattern]) => pattern.test(value))?.[1];

export function describeDevice(userAgent?: string | null): { label: string; kind: DeviceKind } {
  if (!userAgent) return { label: "Unknown device", kind: "desktop" };

  const browser = match(userAgent, BROWSERS);
  const system = match(userAgent, SYSTEMS);
  const kind: DeviceKind = /iPad|Tablet/.test(userAgent) ? "tablet" : /Mobi|iPhone|Android/.test(userAgent) ? "mobile" : "desktop";
  const label = browser && system ? `${browser} on ${system}` : (browser ?? system ?? "Unknown device");

  return { label, kind };
}

const LOOPBACK = new Set(["127.0.0.1", "::1", "::", "::ffff:127.0.0.1"]);

// "0000:0000:…:0000" → "::", and loopback addresses read as "Localhost"
export function formatIpAddress(ip?: string | null) {
  if (!ip) return "Unknown location";

  let address = ip.trim().toLowerCase();
  if (address.includes(":")) {
    address = address
      .split(":")
      .map((group) => group.replace(/^0+(?=.)/, ""))
      .join(":")
      .replace(/(^|:)0(:0)+(:|$)/, "::")
      .replace(/:{3,}/, "::");
  }

  return LOOPBACK.has(address) ? "Localhost" : address;
}
