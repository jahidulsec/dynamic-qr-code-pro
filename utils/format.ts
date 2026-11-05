export const shortLink = (baseUrl: string, slug: string) =>
  `${baseUrl}/${slug}`;

// "qr.radiant.io/ny-jannat": what people see printed under a code
export const shortLinkLabel = (baseUrl: string, slug: string) =>
  shortLink(baseUrl, slug).replace(/^https?:\/\//, "");

export const randomSlug = () => `qr-${Math.random().toString(36).slice(2, 8)}`;

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

// yyyy-mm-dd in the server's time zone, the format a date input expects
export const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const toArray = <V>(value: V | V[] | undefined): V[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];
