import prisma from "@/config/db";
import { Prisma } from "@/generated/prisma/client";
import type { ReportPeriod } from "@/features/reports/schemas/reports-schema";

// grouped and raw queries aren't supported by the cached service layer, so these read Prisma directly.
// Every query is scoped to the organization's QR codes outside the trash.

const TOP_CAMPAIGNS = 10;

type Bucket = { key: string; label: string; fullLabel: string };

const pad = (value: number) => String(value).padStart(2, "0");
const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const PERIODS: Record<
  ReportPeriod,
  {
    /** buckets on the chart */
    count: number;
    /** MySQL DATE_FORMAT pattern; must produce the same keys as `key` */
    format: string;
    /** first bucket of the window, from the start of today */
    start: (today: Date) => void;
    /** moves a date forward by `steps` buckets (negative to go back) */
    step: (date: Date, steps: number) => void;
    key: (date: Date) => string;
    label: (date: Date) => string;
    fullLabel: (date: Date) => string;
  }
> = {
  daily: {
    count: 24,
    format: "%Y-%m-%d %H",
    start: () => {},
    step: (date, steps) => date.setHours(date.getHours() + steps),
    key: (date) => `${dayKey(date)} ${pad(date.getHours())}`,
    label: (date) => date.toLocaleTimeString("en-US", { hour: "numeric" }),
    fullLabel: (date) =>
      `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "")}, ${date.toLocaleTimeString("en-US", { hour: "numeric" })}`,
  },
  weekly: {
    count: 7,
    format: "%Y-%m-%d",
    start: (today) => today.setDate(today.getDate() - 6),
    step: (date, steps) => date.setDate(date.getDate() + steps),
    key: dayKey,
    label: (date) => date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", ""),
    fullLabel: (date) => date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", ""),
  },
  monthly: {
    count: 30,
    format: "%Y-%m-%d",
    start: (today) => today.setDate(today.getDate() - 29),
    step: (date, steps) => date.setDate(date.getDate() + steps),
    key: dayKey,
    label: (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fullLabel: (date) => date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", ""),
  },
  yearly: {
    count: 12,
    format: "%Y-%m",
    start: (today) => {
      today.setDate(1);
      today.setMonth(today.getMonth() - 11);
    },
    step: (date, steps) => date.setMonth(date.getMonth() + steps),
    key: (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`,
    label: (date) => date.toLocaleDateString("en-US", { month: "short" }),
    fullLabel: (date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  },
};

// the current window runs from the first bucket until now; the previous one is the same stretch one period earlier
function reportWindow(period: ReportPeriod, now: Date) {
  const config = PERIODS[period];

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  config.start(start);

  const buckets: Bucket[] = Array.from({ length: config.count }, (_, index) => {
    const date = new Date(start);
    config.step(date, index);
    return { key: config.key(date), label: config.label(date), fullLabel: config.fullLabel(date) };
  });

  const shiftBack = (date: Date) => {
    const shifted = new Date(date);
    config.step(shifted, -config.count);
    return shifted;
  };

  return { start, buckets, previousStart: shiftBack(start), previousEnd: shiftBack(now), format: config.format };
}

const scopeSql = (organizationId: string, tagId?: string | null) =>
  Prisma.sql`c.organizationId = ${organizationId} AND c.deletedAt IS NULL${
    tagId ? Prisma.sql` AND EXISTS (SELECT 1 FROM _QrCodeToQrTag qt WHERE qt.A = c.id AND qt.B = ${tagId})` : Prisma.empty
  }`;

// tag names are unique per organization; null when the department doesn't exist (any more)
export const findReportTag = (organizationId: string, name: string) =>
  prisma.qrTag.findUnique({
    where: { organizationId_name: { organizationId, name } },
    select: { id: true, name: true },
  });

type ReportTag = { id: string; name: string };

export async function buildScanReport({
  organizationId,
  tag,
  period,
}: {
  organizationId: string;
  /** null for every department */
  tag: ReportTag | null;
  period: ReportPeriod;
}) {
  const now = new Date();
  const { start, buckets, previousStart, previousEnd, format } = reportWindow(period, now);

  // scans are stored in UTC; shift them into the server's time zone before grouping
  const offsetMinutes = -start.getTimezoneOffset();
  const scope = scopeSql(organizationId, tag?.id);
  const everyDepartment = scopeSql(organizationId);
  const liveCodes = { organizationId, deletedAt: null, ...(tag ? { tags: { some: { id: tag.id } } } : {}) } satisfies Prisma.QrCodeWhereInput;

  const [seriesRows, previousRows, campaigns, active, allScanRows, tagScanRows, untaggedCodes, tags, topRows] = await Promise.all([
    prisma.$queryRaw<{ bucket: string; scans: bigint | number }[]>(
      Prisma.sql`SELECT DATE_FORMAT(DATE_ADD(s.scannedAt, INTERVAL ${offsetMinutes} MINUTE), ${format}) AS bucket, COUNT(*) AS scans
        FROM qr_scan s JOIN qr_code c ON c.id = s.qrCodeId
        WHERE ${scope} AND s.scannedAt >= ${start}
        GROUP BY bucket`,
    ),
    prisma.$queryRaw<{ scans: bigint | number }[]>(
      Prisma.sql`SELECT COUNT(*) AS scans
        FROM qr_scan s JOIN qr_code c ON c.id = s.qrCodeId
        WHERE ${scope} AND s.scannedAt >= ${previousStart} AND s.scannedAt < ${previousEnd}`,
    ),
    prisma.qrCode.count({ where: liveCodes }),
    prisma.qrCode.count({ where: { ...liveCodes, status: "ACTIVE" } }),
    // the distribution always compares every department, so it ignores the selected one
    prisma.$queryRaw<{ scans: bigint | number }[]>(
      Prisma.sql`SELECT COUNT(*) AS scans
        FROM qr_scan s JOIN qr_code c ON c.id = s.qrCodeId
        WHERE ${everyDepartment} AND s.scannedAt >= ${start}`,
    ),
    // a scan of a code with several tags counts toward each of them; untagged scans group under null
    prisma.$queryRaw<{ tagId: string | null; scans: bigint | number }[]>(
      Prisma.sql`SELECT qt.B AS tagId, COUNT(*) AS scans
        FROM qr_scan s JOIN qr_code c ON c.id = s.qrCodeId
        LEFT JOIN _QrCodeToQrTag qt ON qt.A = c.id
        WHERE ${everyDepartment} AND s.scannedAt >= ${start}
        GROUP BY qt.B`,
    ),
    prisma.qrCode.count({ where: { organizationId, deletedAt: null, tags: { none: {} } } }),
    prisma.qrTag.findMany({
      where: { organizationId },
      select: { id: true, name: true, _count: { select: { qrCodes: { where: { deletedAt: null } } } } },
    }),
    // rank on the scan table alone, then join the few winners for their details
    prisma.$queryRaw<
      { id: number; name: string; destination: string; scans: bigint | number }[]
    >(
      Prisma.sql`SELECT q.id, q.name, q.destination, ranked.scans
        FROM (
          SELECT s.qrCodeId, COUNT(*) AS scans
          FROM qr_scan s JOIN qr_code c ON c.id = s.qrCodeId
          WHERE ${scope} AND s.scannedAt >= ${start}
          GROUP BY s.qrCodeId
          ORDER BY scans DESC, s.qrCodeId DESC
          LIMIT ${Prisma.raw(String(TOP_CAMPAIGNS))}
        ) ranked
        JOIN qr_code q ON q.id = ranked.qrCodeId
        ORDER BY ranked.scans DESC, q.id DESC`,
    ),
  ]);

  const scansByBucket = new Map(seriesRows.map((row) => [row.bucket, Number(row.scans)]));
  const series = buckets.map((bucket) => ({ ...bucket, scans: scansByBucket.get(bucket.key) ?? 0 }));

  const total = series.reduce((sum, point) => sum + point.scans, 0);
  const previousTotal = Number(previousRows[0]?.scans ?? 0);
  // no baseline to compare against when the previous window had no scans
  const change = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null;

  // the first bucket wins a tie, so the label is stable
  const peak = total
    ? series.reduce((best, point) => (point.scans > best.scans ? point : best))
    : null;

  const scansByTag = new Map(tagScanRows.map((row) => [row.tagId, Number(row.scans)]));
  // share of every scan in the window; with multi-tagged codes the shares can add up past 100%
  const allScans = Number(allScanRows[0]?.scans ?? 0);
  const departmentRow = (id: string | null, name: string | null, qrCount: number) => {
    const scans = scansByTag.get(id) ?? 0;
    return { name, qrCount, scans, percent: allScans ? (scans / allScans) * 100 : 0 };
  };
  const untagged = departmentRow(null, null, untaggedCodes);
  const distribution = [
    ...tags.map((row) => departmentRow(row.id, row.name, row._count.qrCodes)),
    ...(untagged.qrCount || untagged.scans ? [untagged] : []),
  ].sort((a, b) => b.scans - a.scans || b.qrCount - a.qrCount || (a.name ?? "~").localeCompare(b.name ?? "~"));

  const topTags = topRows.length
    ? await prisma.qrCode.findMany({
        where: { id: { in: topRows.map((row) => Number(row.id)) } },
        select: { id: true, tags: { select: { name: true }, orderBy: { name: "asc" } } },
      })
    : [];
  const tagsByCode = new Map(topTags.map((row) => [row.id, row.tags.map((tag) => tag.name)]));

  const top = topRows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    destination: row.destination,
    tags: tagsByCode.get(Number(row.id)) ?? [],
    scans: Number(row.scans),
  }));

  return {
    period,
    department: tag?.name ?? null,
    windowStart: start,
    series,
    total,
    previousTotal,
    change,
    peak: peak ? { label: peak.fullLabel, scans: peak.scans } : null,
    campaigns,
    active,
    distribution,
    top,
  };
}

export type ScanReport = Awaited<ReturnType<typeof buildScanReport>>;
export type ScanReportPoint = ScanReport["series"][number];
export type ScanReportDepartment = ScanReport["distribution"][number];
export type ScanReportCampaign = ScanReport["top"][number];
