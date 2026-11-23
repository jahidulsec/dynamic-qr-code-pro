// a code's short link: <base>/<qrId>, where the base already ends in /q
export const shortLink = (baseUrl: string, qrId: string) =>
  `${baseUrl}/${qrId}`;

// "qr.radiant.io/q/V1StGXR8_Z": what people see printed under a code
export const shortLinkLabel = (baseUrl: string, qrId: string) =>
  shortLink(baseUrl, qrId).replace(/^https?:\/\//, "");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });

// dates render on the server in its time zone; don't call these from client components or hydration will mismatch

// "Oct 28, 2026 (Wednesday)"
export const formatCreatedDate = (date: Date) =>
  `${dateFormatter.format(date)} (${weekdayFormatter.format(date)})`;

export const formatDate = (date: Date) => dateFormatter.format(date);

const relativeFormatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
const relativeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

// "3 days ago", "yesterday", "just now"
export const formatRelativeDate = (date: Date, now = new Date()) => {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const unit = relativeUnits.find(([, size]) => Math.abs(seconds) >= size);
  if (!unit) return "just now";
  return relativeFormatter.format(Math.round(seconds / unit[1]), unit[0]);
};

// yyyy-mm-dd in the server's time zone, the format a date input expects
export const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const toArray = <V>(value: V | V[] | undefined): V[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/** a code's tags for display, or a dash when it has none */
export const formatTags = (tags: string[]) => (tags.length ? tags.join(", ") : "—");
